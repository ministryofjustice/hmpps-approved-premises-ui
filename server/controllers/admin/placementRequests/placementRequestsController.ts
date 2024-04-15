import type { Request, Response, TypedRequestHandler } from 'express'
import { ApAreaService, FeatureFlagService, PlacementRequestService } from '../../../services'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly apAreaService: ApAreaService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('admin/placementRequests/show', {
        placementRequest,
      })
    }
  }
}
