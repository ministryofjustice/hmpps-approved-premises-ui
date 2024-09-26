import type { Request, RequestHandler, Response } from 'express'
import type { NewDeparture } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import DepartureService from '../../services/departureService'

import BookingService from '../../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

export default class DeparturesController {
  constructor(
    private readonly departureService: DepartureService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const referenceData = await this.departureService.getReferenceData(req.user.token)

      res.render('departures/new', {
        premisesId,
        booking,
        referenceData,
        pageHeading: 'Log a departure',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { dateTime } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'dateTime')

      const departure = {
        ...req.body.departure,
        dateTime,
      } as NewDeparture

      try {
        await this.departureService.createDeparture(req.user.token, premisesId, bookingId, departure)

        req.flash('success', 'Departure recorded')
        res.redirect(paths.bookings.show({ premisesId, bookingId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.bookings.departures.new({
            premisesId,
            bookingId,
          }),
        )
      }
    }
  }
}
