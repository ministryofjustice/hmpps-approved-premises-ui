import type { Request, RequestHandler, Response } from 'express'
import { BookingService } from '../../services'

export default class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render(`bookings/show`, { booking, premisesId, pageHeading: 'Placement details' })
    }
  }
}
