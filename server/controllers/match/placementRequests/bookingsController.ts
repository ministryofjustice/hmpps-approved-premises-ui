import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService, SessionService } from '../../../services'
import matchPaths from '../../../paths/match'
import adminPaths from '../../../paths/admin'

export default class BookingsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly sessionService: SessionService,
  ) {}

  bookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const confirmPath = matchPaths.placementRequests.bookingNotMade.create({ id: req.params.id })

      const backLink = this.sessionService.getPageBackLink(
        matchPaths.placementRequests.bookingNotMade.confirm.pattern,
        req,
        [
          matchPaths.v2Match.placementRequests.search.occupancy.pattern,
          matchPaths.v2Match.placementRequests.search.spaces.pattern,
          adminPaths.admin.placementRequests.show.pattern,
        ],
      )

      return res.render('match/placementRequests/bookings/unable-to-match', {
        backLink,
        pageHeading: 'Mark as unable to match',
        confirmPath,
      })
    }
  }

  createBookingNotMade(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      await this.placementRequestService.bookingNotMade(req.user.token, req.params.id, { notes: req.body.notes })
      req.flash('success', 'Placement request has been marked as unable to match')

      return res.redirect(adminPaths.admin.cruDashboard.index({}))
    }
  }
}
