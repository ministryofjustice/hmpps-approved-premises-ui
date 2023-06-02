import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementApplicationService, PlacementRequestService } from '../../services'
import paths from '../../paths/placementApplications'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementApplicationService: PlacementApplicationService,
  ) {}

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

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const application = await this.placementApplicationService.create(req.user.token, req.body.applicationId)

      return res.redirect(
        paths.placementApplications.pages.show({
          id: application.id,
          task: 'request-a-placement',
          page: 'reason-for-placement',
        }),
      )
    }
  }
}
