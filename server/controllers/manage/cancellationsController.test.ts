import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { BookingService, CancellationService, PlacementService } from '../../services'
import CancellationsController from './cancellationsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import {
  bookingFactory,
  cancellationFactory,
  cas1SpaceBookingFactory,
  referenceDataFactory,
} from '../../testutils/factories'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'

jest.mock('../../utils/validation')

describe('cancellationsController', () => {
  const token = 'TEST_TOKEN'
  const booking = bookingFactory.build()
  const placement = cas1SpaceBookingFactory.build({ applicationId: booking.applicationId })
  const backLink = `${applyPaths.applications.withdrawables.show({ id: booking.applicationId })}?selectedWithdrawableType=placement`

  const cancellationReasons = referenceDataFactory.buildList(4)

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, headers: { referer: backLink } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesId = 'premises-id'
  const bookingId = 'booking-id'
  const placementId = 'placement-id'

  const cancellationService = createMock<CancellationService>({})
  const bookingService = createMock<BookingService>({})
  const placementService = createMock<PlacementService>({})

  const cancellationsController = new CancellationsController(cancellationService, bookingService, placementService)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingService.find.mockResolvedValue(booking)
    placementService.getPlacement.mockResolvedValue(placement)
    cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
  })

  describe('new', () => {
    it('should render the form with a legacy booking', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      const { arrivalDate, departureDate, person, id } = booking

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        premisesId,
        booking: { arrivalDate, departureDate, person, id },
        backLink,
        cancellationReasons,
        formAction: paths.bookings.cancellations.create({ premisesId, bookingId }),
        pageHeading: 'Confirm withdrawn placement',
        errors: {},
        errorSummary: [],
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
      expect(cancellationService.getCancellationReasons).toHaveBeenCalledWith(token)
    })

    it('should render the form with a placement (space_booking)', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, placementId: placement.id } }, response, next)

      const { canonicalArrivalDate, canonicalDepartureDate, person, id } = placement

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        premisesId,
        booking: { arrivalDate: canonicalArrivalDate, departureDate: canonicalDepartureDate, person, id },
        backLink,
        cancellationReasons,
        pageHeading: 'Confirm withdrawn placement',
        formAction: paths.premises.placements.cancellations.create({ premisesId, placementId: placement.id }),
        errors: {},
        errorSummary: [],
      })

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(cancellationService.getCancellationReasons).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({})

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'cancellations/new',
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        }),
      )
    })

    it('sets the backlink to the withdrawables show page if there is an applicationId on the booking', async () => {
      const bookingWithoutAnApplication = bookingFactory.build({ applicationId: undefined })
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      bookingService.find.mockResolvedValue(bookingWithoutAnApplication)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId }, headers: {} }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'cancellations/new',
        expect.objectContaining({
          backLink: paths.bookings.show({ premisesId, bookingId }),
        }),
      )
    })
  })

  describe('create', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      bookingService.find.mockResolvedValue(booking)
      placementService.getPlacement.mockResolvedValue(placement)
      cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
    })
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

    it('should catch the validation errors when the API returns an error creating a booking cancellation', async () => {
      const requestHandler = cancellationsController.create()
      const localResponse: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
      const localRequest: DeepMocked<Request> = createMock<Request>({
        user: { token },
        headers: { referer: backLink },
        params: {
          bookingId,
          premisesId,
        },
      })

      const err = new Error()

      cancellationService.createCancellation.mockImplementation(() => {
        throw err
      })

      await requestHandler(localRequest, localResponse, next)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        localRequest,
        localResponse,
        err,
        paths.bookings.cancellations.new({
          bookingId,
          premisesId,
        }),
      )
    })

    it('should catch the validation errors when the API returns an error creating a placement cancellation', async () => {
      const requestHandler = cancellationsController.create()
      const localResponse: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
      const localRequest: DeepMocked<Request> = createMock<Request>({
        user: { token },
        headers: { referer: backLink },
        params: {
          placementId,
          premisesId,
        },
      })

      const err = new Error()

      placementService.createCancellation.mockImplementation(() => {
        throw err
      })

      await requestHandler(localRequest, localResponse, next)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        localRequest,
        localResponse,
        err,
        paths.premises.placements.cancellations.new({
          placementId,
          premisesId,
        }),
      )
    })
  })
})
