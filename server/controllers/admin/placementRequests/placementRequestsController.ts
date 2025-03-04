import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../../services'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { bookingSummaryList } from '../../../utils/bookings'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  show(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      const bookingSummary = placementRequest.spaceBookings.length
        ? placementSummaryList(placementRequest)
        : bookingSummaryList(placementRequest.booking)

      res.render('admin/placementRequests/show', {
        adminIdentityBar: adminIdentityBar(placementRequest, res.locals.user),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        bookingSummaryList: bookingSummary,
      })
    }
  }
}
