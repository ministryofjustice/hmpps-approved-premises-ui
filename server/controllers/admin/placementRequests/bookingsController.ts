import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService, PremisesService } from '../../../services'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getAll(req.user.token)
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      res.render('admin/placementRequests/bookings/new', {
        pageHeading: 'Create a placement',
        premises,
        placementRequest,
      })
    }
  }
}
