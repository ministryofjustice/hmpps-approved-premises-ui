import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../services'
import { PlacementRequestSortField, PlacementRequestStatus, SortDirection } from '../../@types/shared'
import paths from '../../paths/admin'
import { createQueryString } from '../../utils/utils'
import { PlacementRequestDashboardSearchOptions, RiskTierLevel } from '../../@types/ui'

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
      const searchOptions = {} as PlacementRequestDashboardSearchOptions

      searchOptions.crn = req.query.crn as string
      searchOptions.tier = req.query.tier as RiskTierLevel
      searchOptions.arrivalDateStart = req.query.arrivalDateStart as string
      searchOptions.arrivalDateEnd = req.query.arrivalDateEnd as string

      const { pageNumber, sortBy, sortDirection } = this.getPaginationDetails(req)

      Object.keys(searchOptions).forEach(k => {
        if (!searchOptions[k]) {
          delete searchOptions[k]
        }
      })

      let hrefPrefix = paths.admin.placementRequests.search({})

      if (Object.keys(searchOptions).length) {
        hrefPrefix += `${createQueryString(searchOptions, { addQueryPrefix: true })}&`
      } else {
        hrefPrefix += '?'
      }

      const dashboard = await this.placementRequestService.search(
        req.user.token,
        searchOptions,
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
        placementRequests: dashboard.data,
        ...searchOptions,
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
