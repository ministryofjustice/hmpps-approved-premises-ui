import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import { NonArrivalReason } from '@approved-premises/api'
import NonArrivalsController from './nonArrivalsController'
import { cas1SpaceBookingFactory, referenceDataFactory } from '../../../../testutils/factories'
import { PremisesService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'
import { ValidationError } from '../../../../utils/errors'

describe('nonArrivalsController', () => {
  const token = 'SAMPLE_TOKEN'
  const premisesId = 'premises-id'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()

  const nonArrivalsController = new NonArrivalsController(premisesService, placementService)

  const placement = cas1SpaceBookingFactory.upcoming().build()
  const uiPlacementPagePath = managePaths.premises.placements.show({ premisesId, placementId: placement.id })
  const uiNonArrivalsPagePath = managePaths.premises.placements.nonArrival({ premisesId, placementId: placement.id })

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('should render the non-arrivals form with a selection of reasons', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
      const nonArrivalReasons: Array<NonArrivalReason> = referenceDataFactory.nonArrivalReason().buildList(20)
      placementService.getNonArrivalReasons.mockResolvedValue(nonArrivalReasons)

      const requestHandler = nonArrivalsController.new()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/non-arrival', {
        nonArrivalReasons,
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it(`Sets the placement's state to non-arrived and returns to the details page`, async () => {
      const requestHandler = nonArrivalsController.create()
      request.body = { reason: 'reason', notes: 'some dummy notes' }

      await requestHandler(request, response, next)

      expect(placementService.recordNonArrival).toHaveBeenCalledWith(token, premisesId, placement.id, request.body)
      expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as not arrived')
      expect(response.redirect).toHaveBeenCalledWith(uiPlacementPagePath)
    })

    it('returns error if page submitted without reason selected', async () => {
      const requestHandler = nonArrivalsController.create()

      request.body = {}

      await requestHandler(request, response, next)

      expect(placementService.recordNonArrival).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        uiNonArrivalsPagePath,
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        reason: 'You must select a reason for non-arrival',
      })
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestHandler = nonArrivalsController.create()
        request.body = { reason: 'test' }

        const err = new Error()

        placementService.recordNonArrival.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          uiNonArrivalsPagePath,
        )
      })
    })
  })
})
