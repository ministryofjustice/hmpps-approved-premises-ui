import type { Request, Response, TypedRequestHandler } from 'express'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'
import { PlacementRequestService } from '../../../services'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  show(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('admin/placementRequests/show', {
        adminIdentityBar: adminIdentityBar(placementRequest, res.locals.user),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        bookingSummaryList: placementRequest.booking ? placementSummaryList(placementRequest) : undefined,
        changeRequestBanners: changeRequestBanners(req.params.id, placementRequest.openChangeRequests, res.locals.user),
      })
    }
  }
}
