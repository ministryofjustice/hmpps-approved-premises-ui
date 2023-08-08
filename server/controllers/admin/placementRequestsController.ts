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
      const { pageNumber, sortBy, sortDirection } = this.getPaginationDetails(req)

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

  search(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const crn = req.query.crn as string
      const { pageNumber, sortBy, sortDirection } = this.getPaginationDetails(req)

      let hrefPrefix = paths.admin.placementRequests.search({})

      if (crn) {
        hrefPrefix += `${createQueryString({ crn }, { addQueryPrefix: true })}&`
      } else {
        hrefPrefix += '?'
      }

      const dashboard = await this.placementRequestService.search(
        req.user.token,
        crn,
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
        placementRequests: dashboard.data,
        crn,
        pageNumber: Number(dashboard.pageNumber),
        totalPages: Number(dashboard.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
      })
    }
  }

  private getPaginationDetails(request: Request) {
    const pageNumber = request.query.page ? Number(request.query.page) : undefined
    const sortBy = request.query.sortBy as PlacementRequestSortField
    const sortDirection = request.query.sortDirection as SortDirection

    return { pageNumber, sortBy, sortDirection }
  }
}
