import type { Request, RequestHandler, Response } from 'express'

import type { NewExtension } from '@approved-premises/api'
import BookingService from '../../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

export default class BookingExtensionsController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render('bookings/extensions/new', {
        pageHeading: 'Update departure date',
        premisesId,
        booking,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const bookingExtension: NewExtension = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'newDepartureDate'),
      }

      try {
        await this.bookingService.changeDepartureDate(req.user.token, premisesId, bookingId, bookingExtension)

        res.redirect(
          paths.v2Manage.bookings.extensions.confirm({
            premisesId,
            bookingId,
          }),
        )
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.v2Manage.bookings.extensions.new({
            premisesId,
            bookingId,
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render('bookings/extensions/confirm', {
        pageHeading: 'Departure date updated',
        premisesId,
        ...booking,
      })
    }
  }
}
