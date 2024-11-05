import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import { DateFormats } from '../../utils/dateUtils'
import BookingService from '../../services/bookingService'
import DateChangesController from './dateChangesController'
import {
  addErrorMessageToFlash,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import { ErrorWithData } from '../../utils/errors'

import { bookingFactory } from '../../testutils/factories'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('dateChangesController', () => {
  const token = 'SOME_TOKEN'
  const backLink = 'http://localhost/some-path'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesId = 'premisesId'
  const bookingId = 'bookingId'
  const requestParams = { user: { token }, params: { premisesId, bookingId }, headers: { referer: backLink } }

  const booking = bookingFactory.build()

  const bookingService = createMock<BookingService>({})

  const controller = new DateChangesController(bookingService)

  beforeEach(() => {
    bookingService.find.mockResolvedValue(booking)
  })

  describe('new', () => {
    request = createMock<Request>(requestParams)

    it('should render the form', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = controller.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/dateChanges/new', {
        premisesId,
        bookingId,
        booking,
        backLink,
        pageHeading: 'Update placement dates',
        errors: {},
        errorSummary: [],
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({ userInput: { backLink: 'http://foo.com' } })

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = controller.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/dateChanges/new', {
        premisesId,
        bookingId,
        booking,
        backLink: 'http://foo.com',
        pageHeading: 'Update placement dates',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('sets a default backlink if the referrer is not present', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = controller.new()

      await requestHandler({ ...request, headers: {} }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/dateChanges/new', {
        premisesId,
        bookingId,
        booking,
        backLink: paths.bookings.show({ premisesId, bookingId }),
        pageHeading: 'Update placement dates',
        errors: {},
        errorSummary: [],
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
    })
  })

  describe('create', () => {
    const bodies = {
      'with new arrival date': {
        body: {
          datesToChange: ['newArrivalDate'],
          ...DateFormats.isoDateToDateInputs('2022-01-01', 'newArrivalDate'),
        },
        expectedPayload: {
          newArrivalDate: '2022-01-01',
        },
      },
      'with new departure date': {
        body: {
          datesToChange: ['newDepartureDate'],
          ...DateFormats.isoDateToDateInputs('2022-01-01', 'newDepartureDate'),
        },
        expectedPayload: {
          newDepartureDate: '2022-01-01',
        },
      },
      'with new departure date and arrival date': {
        body: {
          datesToChange: ['newArrivalDate', 'newDepartureDate'],
          ...DateFormats.isoDateToDateInputs('2022-01-01', 'newDepartureDate'),
          ...DateFormats.isoDateToDateInputs('2022-01-01', 'newArrivalDate'),
        },
        expectedPayload: {
          newArrivalDate: '2022-01-01',
          newDepartureDate: '2022-01-01',
        },
      },
      'with an unexpected body': {
        body: {
          datesToChange: ['someFakeDate'],
          ...DateFormats.isoDateToDateInputs('2022-01-01', 'someFakeDate'),
        },
        expectedPayload: {
          someFakeDate: '2022-01-01',
        },
      },
    }

    it.each(Object.keys(bodies))('creates a Date Change and redirects to the confirmation page %s', async key => {
      const { expectedPayload, body } = bodies[key]

      const requestHandler = controller.create()

      body.backLink = backLink

      request = createMock<Request>({ ...requestParams, body })

      await requestHandler(request, response, next)

      expect(bookingService.changeDates).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedPayload,
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking changed successfully')

      expect(response.redirect).toHaveBeenCalledWith(backLink)
    })

    describe('errors', () => {
      const errors = {
        'newArrivalDate and newDepartureDate are checked': {
          body: { datesToChange: ['newArrivalDate', 'newDepartureDate'] },
          expectedErrorParams: [
            { propertyName: `$.newArrivalDate`, errorType: 'empty' },
            { propertyName: `$.newDepartureDate`, errorType: 'empty' },
          ],
        },
        'newArrivalDate is checked': {
          body: { datesToChange: ['newArrivalDate'] },
          expectedErrorParams: [{ propertyName: `$.newArrivalDate`, errorType: 'empty' }],
        },
        'newDepartureDate is checked': {
          body: { datesToChange: ['newDepartureDate'] },
          expectedErrorParams: [{ propertyName: `$.newDepartureDate`, errorType: 'empty' }],
        },
      }

      it('should catch a validation error when neither date is selected to updated', async () => {
        const requestHandler = controller.create()

        request = createMock<Request>({
          ...requestParams,
          body: { datesToChange: [] },
        })

        await requestHandler(request, response, next)

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          request,
          'You must select a date to change',
          'datesToChange',
        )
      })

      it.each(Object.keys(errors))(
        'should catch a validation error with the correct data when %s but the dates are empty',
        async key => {
          const { body, expectedErrorParams } = errors[key]
          const requestHandler = controller.create()

          request = createMock<Request>({
            ...requestParams,
            body,
          })

          await requestHandler(request, response, next)

          expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
            request,
            response,
            new ErrorWithData({}),
            paths.bookings.dateChanges.new({
              bookingId: request.params.bookingId,
              premisesId: request.params.premisesId,
            }),
          )

          const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

          expect(errorData).toEqual({
            'invalid-params': expectedErrorParams,
          })
        },
      )

      it('should catch the validation errors when the API returns an error', async () => {
        const requestHandler = controller.create()

        request = createMock<Request>(requestParams)

        const err = new Error()

        bookingService.changeDates.mockImplementation(() => {
          throw err
        })

        await requestHandler({ ...request, body: { datesToChange: ['newDepartureDate'] } }, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.dateChanges.new({
            bookingId: request.params.bookingId,
            premisesId: request.params.premisesId,
          }),
        )
      })

      it('should catch the validation errors when new departure date is selected to change and not changed', async () => {
        const previousBooking = bookingFactory.build({ departureDate: '2022-01-01' })
        bookingService.find.mockResolvedValue(previousBooking)
        const requestHandler = controller.create()

        request = createMock<Request>(requestParams)

        await requestHandler(
          {
            ...request,
            body: {
              datesToChange: ['newDepartureDate'],
              ...DateFormats.isoDateToDateInputs('2022-01-01', 'newDepartureDate'),
            },
          },
          response,
          next,
        )

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          request,
          'You must change the selected dates to submit',
          'datesToChange',
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.bookings.dateChanges.new({
            bookingId,
            premisesId,
          }),
        )
      })

      it('should catch the validation errors when new arrival date is selected to change and not changed', async () => {
        const previousBooking = bookingFactory.build({ arrivalDate: '2022-01-01' })
        bookingService.find.mockResolvedValue(previousBooking)
        const requestHandler = controller.create()

        request = createMock<Request>(requestParams)

        await requestHandler(
          {
            ...request,
            body: {
              datesToChange: ['newArrivalDate'],
              ...DateFormats.isoDateToDateInputs('2022-01-01', 'newArrivalDate'),
            },
          },
          response,
          next,
        )

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          request,
          'You must change the selected dates to submit',
          'datesToChange',
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.bookings.dateChanges.new({
            bookingId,
            premisesId,
          }),
        )
      })

      it('should catch the validation errors when new arrival date and departure dates are selected to change and not changed', async () => {
        const previousBooking = bookingFactory.build({ arrivalDate: '2022-01-01', departureDate: '2022-01-02' })
        bookingService.find.mockResolvedValue(previousBooking)
        const requestHandler = controller.create()

        request = createMock<Request>(requestParams)

        await requestHandler(
          {
            ...request,
            body: {
              datesToChange: ['newArrivalDate', 'newDepartureDate'],
              ...DateFormats.isoDateToDateInputs('2022-01-01', 'newArrivalDate'),
              ...DateFormats.isoDateToDateInputs('2022-01-02', 'newDepartureDate'),
            },
          },
          response,
          next,
        )

        expect(addErrorMessageToFlash).toHaveBeenCalledWith(
          request,
          'You must change the selected dates to submit',
          'datesToChange',
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.bookings.dateChanges.new({
            bookingId,
            premisesId,
          }),
        )
      })
    })
  })
})
