import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequests = await this.placementRequestService.getAll(req.user.token)

      res.render('match/placementRequests/index', {
        pageHeading: 'Placement requests',
        placementRequests,
      })
    }
  }
}
