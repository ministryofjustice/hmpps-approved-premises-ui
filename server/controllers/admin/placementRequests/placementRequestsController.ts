import type { Request, Response, TypedRequestHandler } from 'express'
import { PlacementRequestService } from '../../../services'
import { PlacementRequestSortField, PlacementRequestStatus } from '../../../@types/shared'
import paths from '../../../paths/admin'
import { PlacementRequestDashboardSearchOptions, RiskTierLevel } from '../../../@types/ui'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'

export default class PlacementRequestsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const status = (req.query.status as PlacementRequestStatus) || 'notMatched'

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
        req,
        paths.admin.placementRequests.index({}),
        { status },
      )

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

      searchOptions.crnOrName = req.query?.crnOrName as string
      searchOptions.tier = req.query?.tier as RiskTierLevel
      searchOptions.arrivalDateStart = req.query?.arrivalDateStart as string
      searchOptions.arrivalDateEnd = req.query?.arrivalDateEnd as string

      Object.keys(searchOptions).forEach(k => {
        if (!searchOptions[k]) {
          delete searchOptions[k]
        }
      })

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
        req,
        paths.admin.placementRequests.search({}),
        searchOptions,
      )

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
}
