import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'
import { PlacementRequestSortField } from '../../@types/shared'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const isParole = req.query.isParole === '1'
      const pageNumber = req.query.page ? Number(req.query.page) : undefined
      const sortBy = req.query.sortBy as PlacementRequestSortField
      const dashboard = await this.placementRequestService.getDashboard(req.user.token, isParole, pageNumber, sortBy)

      res.render('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
        placementRequests: dashboard.data,
        isParole,
        pageNumber: Number(dashboard.pageNumber),
        totalPages: Number(dashboard.totalPages),
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
