import type { Request, RequestHandler, Response } from 'express'

import type { NewCancellation } from '@approved-premises/api'

import { BookingService, CancellationService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const cancellationReasons = await this.cancellationService.getCancellationReasons(req.user.token)
      let backLink: string

      if (booking?.applicationId) {
        backLink = `${applyPaths.applications.withdrawables.show({ id: booking.applicationId })}?selectedWithdrawableType=placement`
      } else {
        backLink = paths.bookings.show({ premisesId, bookingId })
      }

      res.render('cancellations/new', {
        premisesId,
        booking,
        backLink,
        cancellationReasons,
        pageHeading: 'Confirm withdrawn placement',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      let date: string

      try {
        date = DateFormats.dateAndTimeInputsToIsoString(req.body, 'date').date
        DateFormats.isoToDateObj(date)
      } catch (error) {
        date = DateFormats.dateObjToIsoDate(new Date())
      }

      const cancellation = {
        ...req.body.cancellation,
        date,
      } as NewCancellation

      try {
        await this.cancellationService.createCancellation(req.user.token, premisesId, bookingId, cancellation)

        res.render('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.bookings.cancellations.new({
            bookingId,
            premisesId,
          }),
        )
      }
    }
  }
}
