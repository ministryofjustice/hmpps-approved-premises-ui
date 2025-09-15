import type { Request, Response, TypedRequestHandler } from 'express'
import { changeRequestBanners } from '../../../utils/placementRequests/changeRequestsUtils'
import { PlacementRequestService, SessionService } from '../../../services'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { adminIdentityBar } from '../../../utils/placementRequests'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'
import paths from '../../../paths/admin'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly sessionService: SessionService,
  ) {}

  show(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { placementRequestId } = req.params
      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      res.render('admin/placementRequests/show', {
        backlink: this.sessionService.getPageBackLink(paths.admin.placementRequests.show.pattern, req, [
          paths.admin.cruDashboard.index.pattern,
          paths.admin.cruDashboard.changeRequests.pattern,
          paths.admin.cruDashboard.search.pattern,
        ]),
        adminIdentityBar: adminIdentityBar(placementRequest, res.locals.user),
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRequest,
        placementRequestSummaryList: placementRequestSummaryList(placementRequest),
        bookingSummaryList: placementRequest.booking ? placementSummaryList(placementRequest) : undefined,
        changeRequestBanners: changeRequestBanners(
          placementRequestId,
          placementRequest.openChangeRequests,
          res.locals.user,
        ),
      })
    }
  }
}
