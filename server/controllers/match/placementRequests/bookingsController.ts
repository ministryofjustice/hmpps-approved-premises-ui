import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../../services'
import matchPaths from '../../../paths/match'
import adminPaths from '../../../paths/admin'

export default class BookingsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  bookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const confirmPath = matchPaths.placementRequests.bookingNotMade.create({ id: req.params.id })

      return res.render('match/placementRequests/bookings/unable-to-match', {
        pageHeading: 'Unable to match',
        confirmPath,
      })
    }
  }

  createBookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.placementRequestService.bookingNotMade(req.user.token, req.params.id, { notes: req.body.notes })
      req.flash('success', 'Placement request marked unable to match')

      return res.redirect(adminPaths.admin.placementRequests.index({}))
    }
  }
}
