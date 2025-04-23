import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { endOfTomorrow } from 'date-fns'
import { PlacementRequestService, PlacementService } from '../../../../services'
import { cas1SpaceBookingFactory } from '../../../../testutils/factories'
import managePaths from '../../../../paths/manage'
import * as validationUtils from '../../../../utils/validation'
import { ValidationError } from '../../../../utils/errors'
import PlannedTransferController from './plannedTransferController'
import * as transferUtils from '../../../../utils/placements/transfers'
import { mapChangeRequestReasonsToRadios } from '../../../../utils/placements/changeRequests'
import { convertObjectsToRadioItems } from '../../../../utils/formUtils'
import { DateFormats } from '../../../../utils/dateUtils'
import { plannedTransferSuccessMessage } from '../../../../utils/placements/transfers'

describe('plannedTransferController', () => {
  const token = 'TEST_TOKEN'
  const premisesId = 'Premises_id'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const placementRequestService = createMock<PlacementRequestService>()
  const controller = new PlannedTransferController(placementService, placementRequestService)

  const placement = cas1SpaceBookingFactory.current().build()

  const params = { premisesId, placementId: placement.id }
  const paths = {
    new: managePaths.premises.placements.transfers.new(params),
    details: managePaths.premises.placements.transfers.plannedDetails(params),
    confirm: managePaths.premises.placements.transfers.plannedConfirm(params),
  }

  const errors: ErrorsAndUserInput = { errorTitle: 'Error title', errors: {}, errorSummary: [], userInput: {} }
  const changeRequestReasons = [
    { name: 'reasonNumber1', id: 'id1' },
    { name: 'reasonNumber2', id: 'id2' },
  ]
  const yesNoRadioItems = [
    { name: 'Yes', id: 'yes' },
    { name: 'No', id: 'no' },
  ]
  const sessionDataNew = { ...DateFormats.dateObjectToDateInputs(endOfTomorrow(), 'transferDate') }
  const details = { isFlexible: 'no', transferReason: 'reasonNumber1', notes: 'notes' }
  const sessionData = { ...sessionDataNew, ...details }

  beforeEach(() => {
    jest.restoreAllMocks()
    placementService.getPlacement.mockResolvedValue(placement)
    placementRequestService.getChangeRequestReasons.mockResolvedValue(changeRequestReasons)
    request = createMock<Request>({
      user: { token },
      params,
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
    })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errors)

    jest.spyOn(controller.formData, 'update')
    jest.spyOn(controller.formData, 'remove')
    jest.spyOn(controller.formData, 'get').mockReturnValue(sessionData)
  })

  describe('details', () => {
    const requestHandler = controller.details()

    it('should render the planned transfer details form', async () => {
      jest.spyOn(controller.formData, 'get').mockReturnValue(sessionDataNew)
      const transferReasonRadioItems = mapChangeRequestReasonsToRadios(changeRequestReasons, 'transferReason', {})
      const isFlexibleRadioItems = convertObjectsToRadioItems(yesNoRadioItems, 'name', 'id', 'isFlexible', {})

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/planned-details', {
        backlink: paths.new,
        pageHeading: 'Enter the transfer details',
        placement,
        transferReasonRadioItems,
        isFlexibleRadioItems,
        ...errors,
        ...sessionDataNew,
      })
    })

    it('should render the planned transfer details form with session data', async () => {
      const transferReasonRadioItems = mapChangeRequestReasonsToRadios(
        changeRequestReasons,
        'transferReason',
        sessionData,
      )
      const isFlexibleRadioItems = convertObjectsToRadioItems(yesNoRadioItems, 'name', 'id', 'isFlexible', sessionData)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/planned-details', {
        backlink: paths.new,
        pageHeading: 'Enter the transfer details',
        placement,
        transferReasonRadioItems,
        isFlexibleRadioItems,
        ...errors,
        ...sessionData,
      })
    })

    it('Should redirect to new if the session fails validation', async () => {
      jest.spyOn(transferUtils, 'validateNew').mockImplementation(() => {
        throw new ValidationError({}, 'path')
      })
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('path')
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [])
    })
  })

  describe('detailsSave', () => {
    const requestHandler = controller.detailsSave()

    it('should validate body data and save in session', async () => {
      jest.spyOn(controller.formData, 'get').mockReturnValue(sessionDataNew)
      request.body = sessionData

      await requestHandler(request, response, next)

      expect(controller.formData.update).toHaveBeenCalledWith(placement.id, request.session, sessionData)
      expect(response.redirect).toHaveBeenCalledWith(paths.confirm)
    })

    it('should validate body data and redirect on error', async () => {
      const expectedErrorSummary = [
        {
          href: '#isFlexible',
          text: 'You must indicate if the transfer date is flexible',
        },
        {
          href: '#transferReason',
          text: 'You must choose a reason for the transfer',
        },
        {
          href: '#notes',
          text: 'You must give the details of the transfer',
        },
      ]

      jest.spyOn(controller.formData, 'get').mockReturnValue(sessionDataNew)
      request.body = {}

      await requestHandler(request, response, next)

      expect(controller.formData.update).toHaveBeenCalledWith(placement.id, request.session, {})
      expect(request.flash.mock.calls[1][1]).toEqual(expectedErrorSummary)
      expect(response.redirect).toHaveBeenCalledWith(paths.details)
    })
  })

  describe('confirm', () => {
    it('should render the confirmation page', async () => {
      await controller.confirm()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/confirm', {
        pageHeading: 'Confirm transfer request',
        placement,
        backlink: paths.details,
        summaryList: transferUtils.plannedTransferSummaryList(sessionData),
        ...errors,
      })
    })

    it('should redirect back to new if initial validation fails', async () => {
      jest.spyOn(controller.formData, 'get').mockReturnValue({})

      await controller.confirm()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.new)
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [expect.objectContaining({ href: '#session' })])
    })

    it('should redirect back to details page if details validation fails', async () => {
      jest.spyOn(controller.formData, 'get').mockReturnValue(sessionDataNew)

      await controller.confirm()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.details)
      expect(request.flash).toHaveBeenCalledWith(
        'errorSummary',
        expect.arrayContaining([
          expect.objectContaining({ href: '#isFlexible' }),
          expect.objectContaining({ href: '#transferReason' }),
          expect.objectContaining({ href: '#notes' }),
        ]),
      )
    })
  })

  describe('create', () => {
    it('should create the change request, clear the session and redirect to the placement view page', async () => {
      const createSpy = jest.spyOn(placementRequestService, 'createPlannedTransfer')

      await controller.create()(request, response, next)

      expect(createSpy).toHaveBeenCalledWith(token, placement.placementRequestId, {
        reasonId: 'id1',
        type: 'plannedTransfer',
        spaceBookingId: placement.id,
        requestJson: JSON.stringify({ transferDate: sessionDataNew.transferDate, ...details }),
      })
      expect(controller.formData.remove).toHaveBeenCalledWith(placement.id, request.session)
      expect(request.flash).toHaveBeenCalledWith('success', plannedTransferSuccessMessage)
      expect(response.redirect).toHaveBeenCalledWith(managePaths.premises.placements.show(params))
    })

    it('should handle API errors', async () => {
      const err = new Error('Some message')
      const catchErrorSpy = jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(null)
      placementRequestService.createPlannedTransfer.mockRejectedValue(err)

      await controller.create()(request, response, next)

      expect(catchErrorSpy).toHaveBeenCalledWith(request, response, err, paths.confirm)
    })
  })
})
