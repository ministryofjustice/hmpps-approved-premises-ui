import type { Cas1NewChangeRequest, Cas1SpaceBooking, NamedId } from '@approved-premises/api'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PlacementRequestService, PremisesService } from 'server/services'

import { AppealFormData, ErrorsAndUserInput, RadioItem } from '@approved-premises/ui'
import { when } from 'jest-when'
import { cas1SpaceBookingFactory } from '../../../../testutils/factories'

import PlacementAppealController from './placementAppealController'
import * as changeRequestUtils from '../../../../utils/placements/changeRequests'
import managePaths from '../../../../paths/manage'
import * as validationUtils from '../../../../utils/validation'
import { ValidationError } from '../../../../utils/errors'

describe('placementAppealController', () => {
  const token = 'TEST_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>()
  const placementRequestService = createMock<PlacementRequestService>()

  const placementAppealController = new PlacementAppealController(premisesService, placementRequestService)

  const appealReasons: Array<NamedId> = [{ name: 'staffConflictOfInterest', id: 'staffConflictOfInterestId' }]
  const appealReasonRadioItems: Array<RadioItem> = [{ text: 'name', value: 'test' }]
  const sessionData: AppealFormData & { staffConflictOfInterestDetail: string } = {
    areaManagerName: 'testName',
    areaManagerEmail: 'testEmail',
    appealReason: 'staffConflictOfInterest',
    staffConflictOfInterestDetail: 'Detail for staff conflict',
    notes: 'notes',
    approvalDate: '2025-06-05',
    'approvalDate-day': '05',
    'approvalDate-month': '06',
    'approvalDate-year': '2025',
  }

  const errors = { field: 'error text' }
  const errorsAndUserInput: ErrorsAndUserInput = {
    errorTitle: 'Error title',
    errors: {},
    errorSummary: [],
    userInput: {},
  }
  const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      params: { premisesId, placementId: placement.id },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
    })
    response = createMock<Response>({ locals: { user: { permissions: ['cas1_space_booking_list'] } } })
    premisesService.getPlacement.mockResolvedValue(placement)
    placementRequestService.getChangeRequestReasons.mockResolvedValue(appealReasons)
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(changeRequestUtils, 'mapChangeRequestReasonsToRadios').mockReturnValue(appealReasonRadioItems)
    jest.spyOn(placementAppealController.formData, 'update')
    jest.spyOn(placementAppealController.formData, 'remove')
  })

  describe('new', () => {
    it('should render the appeal form', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = placementAppealController.new()
      await requestHandler(request, response, next)

      expect(placementRequestService.getChangeRequestReasons).toHaveBeenCalledWith(token, 'placementAppeal')
      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(changeRequestUtils.mapChangeRequestReasonsToRadios).toHaveBeenCalledWith(
        appealReasons,
        'appealReason',
        errorsAndUserInput,
        'Add more details',
      )
      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/appeals/new',
        expect.objectContaining({
          placement,
          appealReasonRadioItems,
          ...errorsAndUserInput,
        }),
      )
    })

    it('should populate appeal form from session', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
      jest.spyOn(placementAppealController.formData, 'get').mockReturnValue(sessionData)

      const requestHandler = placementAppealController.new()
      await requestHandler(request, response, next)

      expect(changeRequestUtils.mapChangeRequestReasonsToRadios).toHaveBeenCalledWith(
        appealReasons,
        'appealReason',
        {
          ...sessionData,
          ...errorsAndUserInput,
        },
        'Add more details',
      )
      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/appeals/new',
        expect.objectContaining({
          ...sessionData,
        }),
      )
    })
  })

  describe('newSave', () => {
    it('should validate body data and save in session', async () => {
      jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockReturnValue()
      jest.spyOn(placementAppealController.formData, 'get').mockReturnValue(sessionData)
      request.body = sessionData

      const requestHandler = placementAppealController.newSave()
      await requestHandler(request, response, next)

      expect(changeRequestUtils.validateNewAppealResponse).toHaveBeenCalledWith(sessionData)
      expect(placementAppealController.formData.update).toHaveBeenCalledWith(placement.id, request.session, sessionData)
      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.appeal.confirm({ placementId: placement.id, premisesId }),
      )
    })

    it('should redirect back to new if validation fails', async () => {
      jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockImplementation(() => {
        throw new ValidationError(errors)
      })
      jest.spyOn(placementAppealController.formData, 'get').mockReturnValue(sessionData)
      request.body = sessionData

      const requestHandler = placementAppealController.newSave()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.appeal.new({ placementId: placement.id, premisesId }),
      )
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [{ href: '#field', text: 'error text' }])
    })
  })

  describe('confirm', () => {
    it('should render the confirmation form', async () => {
      const validationSpy = jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockReturnValue()
      jest.spyOn(placementAppealController.formData, 'get').mockReturnValue(sessionData)

      const requestHandler = placementAppealController.confirm()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/appeals/confirm', {
        pageHeading: 'Confirm the appeal details',
        placement,
        backLink: managePaths.premises.placements.appeal.new({ premisesId, placementId: placement.id }),
        postUrl: managePaths.premises.placements.appeal.confirm({ premisesId, placementId: placement.id }),
        summaryList: { rows: changeRequestUtils.getConfirmationSummary(sessionData) },
      })
      expect(validationSpy).toHaveBeenCalledWith(sessionData)
    })

    it('should redirect back to new if validation fails', async () => {
      jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockImplementation(() => {
        throw new ValidationError(errors)
      })
      const requestHandler = placementAppealController.confirm()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.appeal.new({ placementId: placement.id, premisesId }),
      )
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [{ href: '#field', text: 'error text' }])
    })
  })

  describe('create', () => {
    it('should validate the session data, create the change request and redirect to placement details page with flash', async () => {
      jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockReturnValue()
      jest.spyOn(placementAppealController.formData, 'get').mockReturnValue(sessionData)

      const requestHandler = placementAppealController.create()
      await requestHandler(request, response, next)

      const requestJson: typeof sessionData = {
        areaManagerName: sessionData.areaManagerName,
        areaManagerEmail: sessionData.areaManagerEmail,
        appealReason: sessionData.appealReason,
        approvalDate: sessionData.approvalDate,
        notes: sessionData.notes,
        staffConflictOfInterestDetail: sessionData.staffConflictOfInterestDetail,
      }
      const payLoad: Cas1NewChangeRequest = {
        reasonId: 'staffConflictOfInterestId',
        type: 'placementAppeal',
        spaceBookingId: placement.id,
        requestJson: JSON.stringify(requestJson),
      }

      expect(placementRequestService.createPlacementAppeal).toHaveBeenCalledWith(
        token,
        placement.placementRequestId,
        payLoad,
      )
      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.show({ placementId: placement.id, premisesId }),
      )
      expect(request.flash).toHaveBeenCalledWith('success', {
        body: "<p>This placement will remain visible under the 'Upcoming' tab until your appeal is progressed by the CRU.</p>",
        heading: 'You have appealed this placement',
      })
      expect(placementAppealController.formData.remove).toHaveBeenCalledWith(placement.id, request.session)
    })

    it('should redirect back to new if validation fails', async () => {
      jest.spyOn(changeRequestUtils, 'validateNewAppealResponse').mockImplementation(() => {
        throw new ValidationError(errors)
      })
      const requestHandler = placementAppealController.create()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.placements.appeal.new({ placementId: placement.id, premisesId }),
      )
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [{ href: '#field', text: 'error text' }])
    })
  })
})
