import { Request, RequestHandler, Response } from 'express'

import { fetchErrorsAndUserInput } from '../../utils/validation'

import { BookingService, PremisesService } from '../../services'

export default class MoveBedsController {
  constructor(private readonly bookingService: BookingService, private readonly premisesService: PremisesService) {}

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
}
