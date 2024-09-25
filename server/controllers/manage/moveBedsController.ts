import { Request, RequestHandler, Response } from 'express'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import { BookingService, PremisesService } from '../../services'
import { NewBedMove } from '../../@types/shared'
import paths from '../../paths/manage'

export default class MoveBedsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const beds = await this.premisesService.getBeds(req.user.token, premisesId)

      res.render('premises/beds/move/new', {
        premisesId,
        booking,
        beds,
        errors,
        errorSummary,
        pageHeading: 'Move person to a new bed',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const newMove: NewBedMove = {
        notes: req.body.notes,
        bedId: req.body.bed,
      }

      try {
        await this.bookingService.moveBooking(req.user.token, premisesId, bookingId, newMove)

        req.flash('success', 'Bed move logged')
        res.redirect(paths.v2Manage.premises.show({ premisesId }))
      } catch (error) {
        catchValidationErrorOrPropogate(req, res, error as Error, paths.bookings.moves.new({ premisesId, bookingId }))
      }
    }
  }
}
