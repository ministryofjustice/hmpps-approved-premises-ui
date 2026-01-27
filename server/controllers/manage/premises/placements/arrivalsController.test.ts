import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import { add, addDays, format } from 'date-fns'
import ArrivalsController from './arrivalsController'
import { cas1SpaceBookingFactory, userFactory } from '../../../../testutils/factories'
import { PremisesService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import paths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'
import { ValidationError } from '../../../../utils/errors'
import { DateFormats, timeAddLeadingZero } from '../../../../utils/dateUtils'
import { placementKeyDetails } from '../../../../utils/placements'
import * as residentUtils from '../../../../utils/resident'

describe('ArrivalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const arrivalsController = new ArrivalsController(premisesService, placementService)

  const premisesId = 'premises-id'
  const placement = cas1SpaceBookingFactory.upcoming().build()

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    request = createMock<Request>({
      user: { token },
      params: { premisesId, placementId: placement.id },
      session: { user: userFactory.build() },
    })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
    jest.spyOn(residentUtils, 'returnPath').mockReturnValue('return path')
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
        backlink: 'return path',
        contextKeyDetails: placementKeyDetails(placement),
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    let arrivalPath: string

    beforeEach(() => {
      arrivalPath = paths.premises.placements.arrival({
        premisesId: request.params.premisesId,
        placementId: request.params.placementId,
      })
    })

    const checkDateErrors = async (body: Record<string, string>, expectedErrorData: Record<string, string>) => {
      const requestHandler = arrivalsController.create()

      request.body = body

      await requestHandler(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        arrivalPath,
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    }

    it.each([
      [DateFormats.dateObjToIsoDate(addDays(new Date(), -6)), '9:45'],
      [DateFormats.dateObjToIsoDate(addDays(new Date(), -1)), '12:13'],
    ])('creates the arrival for %s at %s and redirects to the placement page', async (date, time) => {
      request.body = {
        ...DateFormats.dateObjectToDateInputs(DateFormats.isoToDateObj(date), 'arrivalDateTime'),
        arrivalTime: time,
      }

      await arrivalsController.create()(request, response, next)

      expect(placementService.createArrival).toHaveBeenCalledWith(token, premisesId, placement.id, {
        arrivalDate: date,
        arrivalTime: timeAddLeadingZero(time),
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as arrived')
      expect(response.redirect).toHaveBeenCalledWith('return path')
    })

    describe('when submitting', () => {
      it('returns errors for empty arrival date and time', async () => {
        await checkDateErrors(
          {},
          {
            arrivalDateTime: 'You must enter an arrival date',
            arrivalTime: 'You must enter a time of arrival',
          },
        )
      })

      it('returns errors for valid date and invalid time', async () => {
        const body = {
          'arrivalDateTime-year': '2024',
          'arrivalDateTime-month': '12',
          'arrivalDateTime-day': '22',
          arrivalTime: '9am',
        }

        await checkDateErrors(body, {
          arrivalTime: 'You must enter a valid time of arrival in 24-hour format',
        })
      })

      it('returns errors for both valid date and invalid time', async () => {
        const body = {
          'arrivalDateTime-year': '2024',
          'arrivalDateTime-month': '12',
          'arrivalDateTime-day': '34',
          arrivalTime: '20:67',
        }

        await checkDateErrors(body, {
          arrivalTime: 'You must enter a valid time of arrival in 24-hour format',
          arrivalDateTime: 'You must enter a valid arrival date',
        })
      })

      it('returns errors for invalid date and valid time', async () => {
        const body = {
          'arrivalDateTime-year': '2024',
          'arrivalDateTime-month': '13',
          'arrivalDateTime-day': '34',
          arrivalTime: '9:16',
        }

        await checkDateErrors(body, {
          arrivalDateTime: 'You must enter a valid arrival date',
        })
      })

      it('returns error for time in the future', async () => {
        const date = add(new Date(), { minutes: 1 })

        const body = {
          'arrivalDateTime-year': format(date, 'yyyy'),
          'arrivalDateTime-month': format(date, 'MM'),
          'arrivalDateTime-day': format(date, 'dd'),
          arrivalTime: format(date, 'HH:mm'),
        }
        await checkDateErrors(body, {
          arrivalTime: 'The time of arrival must be in the past',
        })
      })

      it('returns error for date in the future', async () => {
        const date = add(new Date(), { days: 1 })

        const body = {
          'arrivalDateTime-year': format(date, 'yyyy'),
          'arrivalDateTime-month': format(date, 'MM'),
          'arrivalDateTime-day': format(date, 'dd'),
          arrivalTime: format(date, 'HH:mm'),
        }
        await checkDateErrors(body, {
          arrivalDateTime: 'The date of arrival must be today or in the past',
        })
      })

      it('returns error for date more than 7 days ago', async () => {
        const date = add(new Date(), { days: -7 })

        const body = {
          'arrivalDateTime-year': format(date, 'yyyy'),
          'arrivalDateTime-month': format(date, 'MM'),
          'arrivalDateTime-day': format(date, 'dd'),
          arrivalTime: format(date, 'HH:mm'),
        }
        await checkDateErrors(body, {
          arrivalDateTime: 'The date of arrival cannot be more than 7 days ago',
        })
      })

      it('does not return an error for a date more than 7 days ago if the user has the correct permission', async () => {
        request.body = {
          ...DateFormats.dateObjectToDateInputs(addDays(new Date(), -8), 'arrivalDateTime'),
          arrivalTime: '10:00',
        }
        request.session.user = userFactory.build({ permissions: ['cas1_space_booking_record_arrival_no_date_limit'] })

        await arrivalsController.create()(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).not.toHaveBeenCalled()
      })
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const arrivaldateTime = addDays(new Date(), -1)
        request.body = {
          ...DateFormats.dateObjectToDateInputs(arrivaldateTime, 'arrivalDateTime'),
          arrivalTime: '9:45',
        }

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
