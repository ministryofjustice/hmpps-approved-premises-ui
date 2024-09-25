import { Request, RequestHandler, Response } from 'express'

import type { NewNonarrival } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import NonArrivalService from '../../services/nonArrivalService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

export default class NonArrivalsController {
  constructor(private readonly nonArrivalService: NonArrivalService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const nonArrivalReasons = await this.nonArrivalService.getReasons(req.user.token)

      res.render('nonarrivals/new', {
        premisesId,
        bookingId,
        errors,
        errorSummary,
        nonArrivalReasons,
        pageHeading: 'Record a non-arrival',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const { nonArrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'nonArrivalDate')

      const nonArrival: NewNonarrival = {
        ...req.body.nonArrival,
        date: nonArrivalDate,
      }

      try {
        await this.nonArrivalService.createNonArrival(req.user.token, premisesId, bookingId, nonArrival)

        req.flash('success', 'Non-arrival logged')
        res.redirect(paths.v2Manage.premises.show({ premisesId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.bookings.nonArrivals.new({ premisesId, bookingId }),
        )
      }
    }
  }
}
