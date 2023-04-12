import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequests = await this.placementRequestService.getAll(req.user.token)

      res.render('match/placementRequests/index', {
        pageHeading: 'My Cases',
        placementRequests,
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('match/placementRequests/show', {
        pageHeading: `Matching information for ${placementRequest.person.name}`,
        placementRequest,
      })
    }
  }
}
