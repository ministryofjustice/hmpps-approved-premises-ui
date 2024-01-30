import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { BookingService, PersonService } from '../../services'
import BookingsController from './bookingsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import {
  activeOffenceFactory,
  bookingFactory,
  newBookingFactory,
  personFactory,
  restrictedPersonFactory,
} from '../../testutils/factories'
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
  const personService = createMock<PersonService>({})
  const bookingController = new BookingsController(bookingService, personService)

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
      const offence = activeOffenceFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([person.crn]),
          params: { premisesId },
        })

        personService.findByCrn.mockResolvedValue(person)
        personService.getOffences.mockResolvedValue([offence])
      })

      it('if the CRN is not restricted it should render the new booking form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {}, errorTitle: '' }
        })

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/new', {
          premisesId,
          pageHeading: 'Create a placement',
          offences: [offence],
          ...person,
          errors: {},
          errorSummary: [],
          errorTitle: '',
        })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
        expect(request.flash).toHaveBeenCalledWith('crn')
      })

      it('calls render with the noOffence view when the person dont have any offences', async () => {
        const offences = activeOffenceFactory.buildList(0)
        personService.getOffences.mockResolvedValue(offences)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/people/noOffence', {
          pageHeading: 'There are no offences for this person',
          bodyTextParam: 'a placement in an Approved Premises,',
          backTextParam: 'Approved Premises',
          href: paths.premises.show({ premisesId }),
        })
      })

      it('if the CRN is restricted it should render the CRN form with an error', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {}, errorTitle: '' }
        })
        const restrictedPerson = restrictedPersonFactory.build()
        personService.findByCrn.mockResolvedValue(restrictedPerson)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/find', {
          premisesId,
          pageHeading: 'Create a placement - find someone by CRN',
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
          offences: [offence],
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
          params: { premisesId, bedId },
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
      const newBooking = newBookingFactory.build()
      const booking = bookingFactory.build()
      bookingService.create.mockResolvedValue(booking)

      request = {
        ...request,
        params: { premisesId },
        body: newBooking,
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
          }),
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
      })
    })
  })
})
