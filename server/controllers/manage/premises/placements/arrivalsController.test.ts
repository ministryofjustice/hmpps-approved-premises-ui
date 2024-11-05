import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import ArrivalsController from './arrivalsController'
import { spaceBookingFactory } from '../../../../testutils/factories'
import { PremisesService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import paths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'

describe('ArrivalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const arrivalsController = new ArrivalsController(premisesService, placementService)

  const premisesId = 'premises-id'
  const placement = spaceBookingFactory.build()

  beforeEach(() => {
    premisesService.getPlacement.mockResolvedValue(placement)
    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
  })

  describe('new', () => {
    it('renders the form with placement information, errors and user input', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = arrivalsController.new()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/placements/arrivals/new', {
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates the arrival and redirects to the placement page', async () => {
      const requestHandler = arrivalsController.create()

      request.body = {
        expectedDepartureDate: '2025-04-01',
        'arrivalDate-year': '2024',
        'arrivalDate-month': '11',
        'arrivalDate-day': '5',
        arrivalTime: '10:45',
      }

      await requestHandler(request, response, next)

      expect(placementService.createArrival).toHaveBeenCalledWith(token, premisesId, placement.id, {
        expectedDepartureDate: '2025-04-01',
        arrivalDateTime: '2024-11-05T10:45:00.000Z',
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as arrived')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.show({ premisesId, bookingId: placement.id }),
      )
    })

    describe('when errors are raised', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)

        const requestHandler = arrivalsController.create()

        const err = new Error()

        placementService.createArrival.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.premises.placements.arrival({
            premisesId: request.params.premisesId,
            bookingId: request.params.placementId,
          }),
        )
      })
    })
  })
})
