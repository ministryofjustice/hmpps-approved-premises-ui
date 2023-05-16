import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import { SanitisedError } from '../../sanitisedError'
import { BookingService, PersonService, PremisesService } from '../../services'
import BookingsController from './bookingsController'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'

import { bookingFactory, newBookingFactory, personFactory } from '../../testutils/factories'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')
jest.mock('../../utils/bookingUtils')

describe('bookingsController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const bedId = 'bedId'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const premisesService = createMock<PremisesService>({})
  const personService = createMock<PersonService>({})
  const bookingController = new BookingsController(bookingService, premisesService, personService)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    it('should fetch the booking and render the show page', async () => {
      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingController.show()

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/show', {
        booking,
        premisesId,
        pageHeading: 'Placement details',
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })
  })

  describe('new', () => {
    describe('If there is a CRN in the flash', () => {
      const person = personFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([person.crn]),
          params: { premisesId },
        })

        personService.findByCrn.mockResolvedValue(person)
      })

      it('it should render the new booking form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {}, errorTitle: '' }
        })

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/new', {
          premisesId,
          pageHeading: 'Create a placement',
          ...person,
          errors: {},
          errorSummary: [],
          errorTitle: '',
        })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
        expect(request.flash).toHaveBeenCalledWith('crn')
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/new', {
          premisesId,
          pageHeading: 'Create a placement',
          ...person,
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...errorsAndUserInput.userInput,
        })
      })
    })

    describe('if there is a no CRN in the flash', () => {
      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([]),
          params: { premisesId },
        })
      })

      it('it should render the new booking form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {}, errorTitle: '' }
        })

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/find', {
          premisesId,
          pageHeading: 'Create a placement - find someone by CRN',
          errors: {},
          errorSummary: [],
          errorTitle: '',
        })
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/find', {
          premisesId,
          pageHeading: 'Create a placement - find someone by CRN',
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...errorsAndUserInput.userInput,
        })
      })
    })
  })

  describe('create', () => {
    it('given the expected form data, the posting of the booking is successful should redirect to the "confirmation" page', async () => {
      const newBooking = newBookingFactory.build()
      const booking = bookingFactory.build()
      bookingService.create.mockResolvedValue(booking)

      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId, bedId },
        body: newBooking,
      }

      await requestHandler(request, response, next)

      expect(bookingService.create).toHaveBeenCalledWith(token, premisesId, newBooking)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.confirm({
          premisesId,
          bookingId: booking.id,
        }),
      )
    })

    describe('when errors are raised', () => {
      const flashSpy = jest.fn().mockImplementation(() => ['some-crn'])

      request = {
        ...request,
        params: { premisesId, bedId },
        flash: flashSpy,
      }

      const requestHandler = bookingController.create()

      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error()

        bookingService.create.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.new({
            premisesId,
            bedId,
          }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        const err = createMock<SanitisedError>({ status: 409, data: 'some data' })

        bookingService.create.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(generateConflictErrorAndRedirect).toHaveBeenCalledWith(
          request,
          response,
          premisesId,
          bedId,
          ['arrivalDate', 'departureDate'],
          err,
          paths.bookings.new({ premisesId, bedId }),
        )
      })
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = bookingFactory.build({
        arrivalDate: new Date('07/27/22').toISOString(),
        departureDate: new Date('07/28/22').toISOString(),
      })
      const overcapacityMessage = 'The premises is over capacity for the period January 1st 2023 to Feburary 3rd 2023'
      premisesService.getOvercapacityMessage.mockResolvedValue([overcapacityMessage])
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingController.confirm()

      request = {
        ...request,
        params: {
          premisesId,
          bookingId: booking.id,
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('bookings/confirm', {
        premisesId,
        pageHeading: 'Placement confirmed',
        bookingId: booking.id,
        ...booking,
        infoMessages: [overcapacityMessage],
      })
    })
  })
})
