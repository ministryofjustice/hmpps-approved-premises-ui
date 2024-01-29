import type { Request, Response, TypedRequestHandler } from 'express'
import { ApAreaService, PlacementRequestService } from '../../../services'
import { PlacementRequestSortField } from '../../../@types/shared'
import paths from '../../../paths/admin'
import { PlacementRequestDashboardSearchOptions } from '../../../@types/ui'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { getSearchOptions } from '../../../utils/getSearchOptions'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly apAreaService: ApAreaService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const [apAreaId, requestType] = ['apArea', 'requestType'].map(filter =>
        req.query[filter] ? req.query[filter] : req.body[filter],
      )
      let status = req.query.status ? req.query.status : req.body.status
      if (status === undefined) {
        status = 'notMatched'
      }

      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
        req,
        paths.admin.placementRequests.index({}),
        { status },
      )

      const dashboard = await this.placementRequestService.getDashboard(
        req.user.token,
        { status, apAreaId, requestType },
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
        placementRequests: dashboard.data,
        status,
        apAreas,
        apArea: apAreaId,
        requestType,
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
      const searchOptions = getSearchOptions<PlacementRequestDashboardSearchOptions>(req, [
        'crnOrName',
        'tier',
        'arrivalDateStart',
        'arrivalDateEnd',
      ])

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
