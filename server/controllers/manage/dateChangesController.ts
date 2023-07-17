import type { Request, RequestHandler, Response } from 'express'

import type { NewDateChange } from '@approved-premises/api'

import { flattenCheckboxInput } from '../../utils/formUtils'
import { BookingService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

export default class DateChangeController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      res.render('bookings/dateChanges/new', {
        premisesId,
        bookingId,
        booking,
        pageHeading: 'Change placement date',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const payload: NewDateChange = {}
      const datesToChange = flattenCheckboxInput(req.body.datesToChange)

      datesToChange.forEach((itemKey: keyof NewDateChange) => {
        payload[itemKey] = DateFormats.dateAndTimeInputsToIsoString(req.body, itemKey)[itemKey]
      })

      try {
        await this.bookingService.changeDates(req.user.token, premisesId, bookingId, payload)

        req.flash('success', 'Booking changed successfully')
        res.redirect(paths.bookings.show({ premisesId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.dateChanges.new({
            bookingId,
            premisesId,
          }),
        )
      }
    }
  }
}
