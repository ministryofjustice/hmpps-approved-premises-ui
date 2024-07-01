import type { Request, RequestHandler, Response } from 'express'

import type { NewDateChange } from '@approved-premises/api'

import { ErrorWithData } from '../../utils/errors'
import { BookingService } from '../../services'
import {
  addErrorMessageToFlash,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

export default class DateChangeController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      let backLink: string

      if (userInput.backLink) {
        backLink = userInput.backLink as string
      } else if (req.headers.referer) {
        backLink = req.headers.referer
      } else {
        backLink = paths.bookings.show({ premisesId, bookingId })
      }

      res.render('bookings/dateChanges/new', {
        premisesId,
        bookingId,
        booking,
        backLink,
        pageHeading: 'Update placement dates',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      try {
        const { backLink, datesToChange } = req.body
        const payload: NewDateChange = {}
        const emptyDates: Array<keyof NewDateChange> = []

        if (!datesToChange?.length) {
          addErrorMessageToFlash(req, 'You must select a date to change', 'datesToChange')
          return res.redirect(
            paths.bookings.dateChanges.new({
              bookingId,
              premisesId,
            }),
          )
        }

        datesToChange.forEach((itemKey: keyof NewDateChange) => {
          const date = DateFormats.dateAndTimeInputsToIsoString(req.body, itemKey)[itemKey]
          if (!date) {
            emptyDates.push(itemKey)
          } else {
            payload[itemKey] = date
          }
        })

        if (payload.newArrivalDate || payload.newDepartureDate) {
          const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
          const datesNotChanged =
            payload.newArrivalDate === booking.arrivalDate || payload.newDepartureDate === booking.departureDate
          if (datesNotChanged) {
            addErrorMessageToFlash(req, 'You must change the selected dates to submit', 'datesToChange')
            return res.redirect(
              paths.bookings.dateChanges.new({
                bookingId,
                premisesId,
              }),
            )
          }
        }

        if (emptyDates.length) {
          const errorData = emptyDates.map((key: keyof NewDateChange) => ({
            propertyName: `$.${key}`,
            errorType: 'empty',
          }))
          throw new ErrorWithData({ 'invalid-params': errorData })
        }

        await this.bookingService.changeDates(req.user.token, premisesId, bookingId, payload)

        req.flash('success', 'Booking changed successfully')
        return res.redirect(backLink)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.bookings.dateChanges.new({
            bookingId,
            premisesId,
          }),
        )
      }
    }
  }
}
