import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'
import { PlacementRequestSortField, PlacementRequestStatus, SortDirection } from '../../@types/shared'
import paths from '../../paths/admin'
import { createQueryString } from '../../utils/utils'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const status = (req.query.status as PlacementRequestStatus) || 'notMatched'
      const pageNumber = req.query.page ? Number(req.query.page) : undefined
      const sortBy = req.query.sortBy as PlacementRequestSortField
      const sortDirection = req.query.sortDirection as SortDirection

      const hrefPrefix = `${paths.admin.placementRequests.index({})}${createQueryString(
        { status },
        { addQueryPrefix: true },
      )}&`

      const dashboard = await this.placementRequestService.getDashboard(
        req.user.token,
        status,
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
        placementRequests: dashboard.data,
        status,
        pageNumber: Number(dashboard.pageNumber),
        totalPages: Number(dashboard.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
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
