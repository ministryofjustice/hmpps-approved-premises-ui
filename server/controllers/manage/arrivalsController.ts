import type { Request, RequestHandler, Response } from 'express'

import type { NewCas1Arrival as NewArrival } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import ArrivalService from '../../services/arrivalService'
import PremisesService from '../../services/premisesService'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

export default class ArrivalsController {
  constructor(
    private readonly arrivalService: ArrivalService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const staffMembers = await this.premisesService.getStaffMembers(req.user.token, premisesId)

      res.render('arrivals/new', {
        premisesId,
        bookingId,
        errors,
        errorSummary,
        staffMembers: staffMembers.filter(staffMember => staffMember.keyWorker),
        pageHeading: 'Mark the person as arrived',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { body } = req

      const { arrivalDateTime } = DateFormats.dateAndTimeInputsToIsoString(body, 'arrivalDateTime')
      const { expectedDepartureDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'expectedDepartureDate')

      const arrival: NewArrival = {
        keyWorkerStaffCode: body.arrival.keyWorkerStaffCode,
        notes: body.arrival.notes,
        arrivalDateTime,
        expectedDepartureDate,
        type: 'CAS1',
      }

      try {
        await this.arrivalService.createArrival(req.user.token, premisesId, bookingId, arrival)

        req.flash('success', 'Arrival logged')
        res.redirect(paths.v2Manage.premises.show({ premisesId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.bookings.arrivals.new({ bookingId, premisesId }),
        )
      }
    }
  }
}
