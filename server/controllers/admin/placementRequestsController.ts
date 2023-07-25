import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const isParole = req.query.isParole === '1'
      const placementRequests = await this.placementRequestService.getDashboard(req.user.token, isParole)

      res.render('admin/placementRequests/index', {
        pageHeading: 'Placement requests',
        placementRequests,
        isParole,
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('admin/placementRequests/show', {
        placementRequest,
      })
    }
  }
}
