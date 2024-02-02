import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import CancellationService from '../../services/cancellationService'
import BookingService from '../../services/bookingService'
import CancellationsController from './cancellationsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import { bookingFactory, cancellationFactory, referenceDataFactory } from '../../testutils/factories'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'

jest.mock('../../utils/validation')

describe('cancellationsController', () => {
  const token = 'SOME_TOKEN'
  const booking = bookingFactory.build()
  const backLink = applyPaths.applications.withdrawables.show({ id: booking.applicationId })
  const cancellationReasons = referenceDataFactory.buildList(4)

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, headers: { referer: backLink } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesId = 'premisesId'
  const bookingId = 'bookingId'

  const cancellationService = createMock<CancellationService>({})
  const bookingService = createMock<BookingService>({})

  const cancellationsController = new CancellationsController(cancellationService, bookingService)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingService.find.mockResolvedValue(booking)
    cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
  })

  describe('new', () => {
    it('should render the form', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        apManager: false,
        premisesId,
        bookingId,
        booking,
        backLink,
        cancellationReasons,
        pageHeading: 'Confirm withdrawn booking',
        errors: {},
        errorSummary: [],
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
      expect(cancellationService.getCancellationReasons).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({ userInput: { backLink: 'http://foo.com' } })

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        apManager: false,
        premisesId,
        bookingId,
        booking,
        backLink: 'http://foo.com',
        cancellationReasons,
        pageHeading: 'Confirm withdrawn booking',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('sets the backlink to the withdrawables show page if there is an applicationId on the booking', async () => {
      const bookingWithoutAnApplication = bookingFactory.build({ applicationId: undefined })
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      bookingService.find.mockResolvedValue(bookingWithoutAnApplication)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId }, headers: {} }, response, next)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        apManager: false,
        premisesId,
        bookingId,
        booking: bookingWithoutAnApplication,
        backLink: paths.bookings.show({ premisesId, bookingId }),
        cancellationReasons,
        pageHeading: 'Confirm withdrawn booking',
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a Cancellation and redirects to the confirmation page', async () => {
      const cancellation = cancellationFactory.build()

      cancellationService.createCancellation.mockResolvedValue(cancellation)

      const requestHandler = cancellationsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'date-year': 2022,
        'date-month': 12,
        'date-day': 11,
        backLink,
        cancellation: {
          notes: 'Some notes',
          reason: '8b2677dd-e5d4-407a-a8f8-e2035aec9227',
        },
      }

      await requestHandler(request, response, next)

      const expectedCancellation = {
        ...request.body.cancellation,
        date: '2022-12-11',
      }

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedCancellation,
      )

      expect(response.render).toHaveBeenCalledWith('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
    })

    it('adds todays date if one is not submitted', async () => {
      const cancellation = cancellationFactory.build()

      cancellationService.createCancellation.mockResolvedValue(cancellation)

      const requestHandler = cancellationsController.create()

      const reason = '8b2677dd-e5d4-407a-a8f8-e2035aec9227'

      request.body = await requestHandler(
        {
          ...request,
          body: {
            backLink,
            cancellation: {
              reason,
            },
          },
          params: {
            bookingId,
            premisesId,
          },
        },
        response,
        next,
      )

      const expectedCancellation = {
        reason,
        date: DateFormats.dateObjToIsoDate(new Date()),
      }

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        token,
        premisesId,
        bookingId,
        expectedCancellation,
      )

      expect(response.render).toHaveBeenCalledWith('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
    })

    it('should catch the validation errors when the API returns an error', async () => {
      const requestHandler = cancellationsController.create()

      request.params = {
        bookingId,
        premisesId,
      }

      const err = new Error()

      cancellationService.createCancellation.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.cancellations.new({
          bookingId: request.params.bookingId,
          premisesId: request.params.premisesId,
        }),
      )
    })
  })
})
