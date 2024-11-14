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
import { ValidationError } from '../../../../utils/errors'

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
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the form with placement information, errors and user input', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = arrivalsController.new()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/arrival', {
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    let arrivalPath: string
    const validBody = {
      'arrivalDateTime-year': '2024',
      'arrivalDateTime-month': '11',
      'arrivalDateTime-day': '5',
      arrivalTime: '9:45',
    }

    beforeEach(() => {
      arrivalPath = paths.premises.placements.arrival({
        premisesId: request.params.premisesId,
        placementId: request.params.placementId,
      })
      request.body = validBody
    })

    it('creates the arrival and redirects to the placement page', async () => {
      const requestHandler = arrivalsController.create()

      await requestHandler(request, response, next)

      expect(placementService.createArrival).toHaveBeenCalledWith(token, premisesId, placement.id, {
        arrivalDateTime: '2024-11-05T09:45:00.000Z',
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as arrived')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.show({ premisesId, placementId: placement.id }),
      )
    })

    describe('when submitting', () => {
      it('returns errors for empty arrival date and time', async () => {
        const requestHandler = arrivalsController.create()

        request.body = {}

        await requestHandler(request, response, next)

        const expectedErrorData = {
          arrivalDateTime: 'You must enter an arrival date',
          arrivalTime: 'You must enter a time of arrival',
        }

        expect(placementService.createArrival).not.toHaveBeenCalled()
        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          arrivalPath,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it('returns errors for invalid date and time', async () => {
        const requestHandler = arrivalsController.create()

        request.body = {
          'arrivalDateTime-year': '2024',
          'arrivalDateTime-month': '13',
          'arrivalDateTime-day': '34',
          arrivalTime: '9am',
        }

        await requestHandler(request, response, next)

        const expectedErrorData = {
          arrivalDateTime: 'You must enter a valid arrival date',
          arrivalTime: 'You must enter a valid time of arrival in 24-hour format',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          arrivalPath,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestHandler = arrivalsController.create()

        const err = new Error()

        placementService.createArrival.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          arrivalPath,
        )
      })
    })
  })
})
