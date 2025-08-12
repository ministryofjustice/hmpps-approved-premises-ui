import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { faker } from '@faker-js/faker'
import { ChangeRequestReason, ErrorsAndUserInput } from '@approved-premises/ui'
import paths from '../../../paths/admin'
import {
  cas1ChangeRequestFactory,
  cas1PlacementRequestDetailFactory,
  cas1SpaceBookingFactory,
} from '../../../testutils/factories'
import { PlacementRequestService, PlacementService } from '../../../services'
import ChangeRequestsController from './changeRequestsController'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { changeRequestSummaryList } from '../../../utils/placementRequests/changeRequestSummaryList'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { DateFormats } from '../../../utils/dateUtils'

describe('plannedTransferController', () => {
  const token = 'TEST_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const placementRequestService = createMock<PlacementRequestService>()
  const controller = new ChangeRequestsController(placementRequestService, placementService)

  const placement = cas1SpaceBookingFactory.upcoming().build()
  const placementRequest = cas1PlacementRequestDetailFactory.withSpaceBooking().build()
  const changeRequest = cas1ChangeRequestFactory.placementAppeal().build({ spaceBookingId: placement.id })
  const changeRequestRejectionReasons: Array<{ name: ChangeRequestReason; id: string }> = [
    { name: 'noSuitableApAvailable', id: faker.string.uuid() },
  ]

  const decisionOptions = [
    {
      checked: false,
      text: 'No suitable AP available',
      value: changeRequestRejectionReasons[0].name,
    },
    {
      divider: 'or',
    },
    {
      text: 'Progress appeal',
      value: 'progress',
    },
  ]

  const errorsAndUserInput: ErrorsAndUserInput = {
    errorTitle: 'Error title',
    errors: {},
    errorSummary: [],
    userInput: {},
  }
  let errorCatchSpy: jest.SpyInstance

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      params: { placementRequestId: placementRequest.id, changeRequestId: changeRequest.id },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
    })
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)
    errorCatchSpy = jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
    placementRequestService.getChangeRequest.mockResolvedValue(changeRequest)
    placementRequestService.getChangeRequestRejectionReasons.mockResolvedValue(changeRequestRejectionReasons)
    placementService.getPlacement.mockResolvedValue(placement)
  })

  describe('review', () => {
    it('should render the review page for a placementAppeal', async () => {
      await controller.review()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/changeRequests/review', {
        pageHeading: 'Review appeal',
        backLink: `/admin/placement-requests/${placementRequest.id}`,
        bookingSummary: placementSummaryList(placementRequest),
        changeRequestSummary: changeRequestSummaryList(changeRequest),
        decisionOptions,
        placementRequest,
        ...errorsAndUserInput,
      })
    })
  })
  describe('decide', () => {
    it('should redirect on no decision validation', async () => {
      request.body = {}
      await controller.decide()(request, response, next)

      const [, , error] = errorCatchSpy.mock.calls[0]
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.admin.placementRequests.changeRequests.review({
          placementRequestId: placementRequest.id,
          changeRequestId: changeRequest.id,
        }),
      )
      expect(error.data).toEqual({ decision: 'You must select a decision' })
    })

    it('should action the appeal if the decision is to progress', async () => {
      request.body = { decision: 'progress', notes: 'some notes' }
      await controller.decide()(request, response, next)

      expect(errorCatchSpy).not.toHaveBeenCalled()
      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(placementService.approvePlacementAppeal).toHaveBeenCalledWith(token, placement.premises.id, placement.id, {
        occurredAt: DateFormats.dateObjToIsoDate(new Date()),
        placementAppealChangeRequestId: changeRequest.id,
        reasonNotes: 'some notes',
      })
      expect(request.flash).toHaveBeenCalledWith('success', {
        heading: 'Appeal actioned',
        body: "<p>The appealed placement has been cancelled. You will need to re-book via the 'Ready to match' list.</p>",
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.admin.placementRequests.show({ placementRequestId: placementRequest.id }),
      )
    })

    it('should reject the appeal if a rejection reason is given', async () => {
      request.body = { decision: changeRequestRejectionReasons[0].name, notes: 'some rejection notes' }
      await controller.decide()(request, response, next)

      expect(errorCatchSpy).not.toHaveBeenCalled()
      expect(placementRequestService.rejectChangeRequest).toHaveBeenCalledWith(token, {
        changeRequestId: changeRequest.id,
        placementRequestId: placementRequest.id,
        rejectChangeRequest: {
          decisionJson: { notes: 'some rejection notes' },
          rejectionReasonId: changeRequestRejectionReasons[0].id,
        },
      })
      expect(request.flash).toHaveBeenCalledWith('success', {
        heading: 'Appeal rejected',
        body: '<p>The placement remains in place. An email will be sent to the AP manager that made the appeal.</p>',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.admin.placementRequests.show({ placementRequestId: placementRequest.id }),
      )
    })
  })
})
