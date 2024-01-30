import type { Request, RequestHandler, Response } from 'express'
import type { NewBooking } from '@approved-premises/api'

import { BookingService, PersonService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'
import { isFullPerson } from '../../utils/personUtils'

export default class BookingsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly personService: PersonService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render(`bookings/show`, { booking, premisesId, pageHeading: 'Placement details' })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const person = await this.personService.findByCrn(req.user.token, crnArr[0])
        const offences = await this.personService.getOffences(req.user.token, person.crn)

        if (isFullPerson(person)) {
          if (offences.length === 0) {
            const bodyTextParam = 'a placement in an Approved Premises,'
            const backTextParam = 'Approved Premises'
            return res.render(`applications/people/noOffence`, {
              pageHeading: 'There are no offences for this person',
              bodyTextParam,
              backTextParam,
              href: paths.premises.show({ premisesId }),
            })
          }
          return res.render(`bookings/new`, {
            pageHeading: 'Create a placement',
            premisesId,
            offences,
            ...person,
            errorTitle,
            errors,
            errorSummary,
            ...userInput,
          })
        }
      }

      return res.render(`bookings/find`, {
        pageHeading: 'Create a placement - find someone by CRN',
        premisesId,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const booking: NewBooking = {
        serviceName: 'approved-premises',
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate'),
      }

      try {
        const confirmedBooking = await this.bookingService.create(req.user.token, premisesId, booking)

        return res.redirect(
          paths.bookings.confirm({
            premisesId,
            bookingId: confirmedBooking.id,
          }),
        )
      } catch (err) {
        req.flash('crn', booking.crn)
        const redirectPath = paths.bookings.new({ premisesId })
        return catchValidationErrorOrPropogate(req, res, err, redirectPath)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render('bookings/confirm', {
        premisesId,
        bookingId,
        pageHeading: 'Placement confirmed',
        ...booking,
      })
    }
  }
}
