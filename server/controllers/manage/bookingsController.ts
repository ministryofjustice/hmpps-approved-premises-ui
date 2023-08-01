import type { Request, RequestHandler, Response } from 'express'
import type { NewBooking } from '@approved-premises/api'

import { BookingService, PersonService, PremisesService } from '../../services'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

export default class BookingsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly premisesService: PremisesService,
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
      const { premisesId, bedId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const person = await this.personService.findByCrn(req.user.token, crnArr[0])

        return res.render(`bookings/new`, {
          pageHeading: 'Create a placement',
          premisesId,
          bedId,
          ...person,
          errorTitle,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render(`bookings/find`, {
        pageHeading: 'Create a placement - find someone by CRN',
        bedId,
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
      const { premisesId, bedId } = req.params

      const booking: NewBooking = {
        serviceName: 'approved-premises',
        bedId,
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

        const redirectPath = paths.bookings.new({ premisesId, bedId })

        if (err.status === 409 && 'data' in err) {
          return generateConflictErrorAndRedirect(
            req,
            res,
            premisesId,
            bedId,
            ['arrivalDate', 'departureDate'],
            err,
            redirectPath,
          )
        }

        return catchValidationErrorOrPropogate(req, res, err, redirectPath)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const overcapacityMessage = await this.premisesService.getOvercapacityMessage(req.user.token, premisesId)

      return res.render('bookings/confirm', {
        premisesId,
        bookingId,
        pageHeading: 'Placement confirmed',
        ...booking,
        infoMessages: overcapacityMessage,
      })
    }
  }
}
