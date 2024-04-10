import type { Request, Response, TypedRequestHandler } from 'express'
import { ApAreaService, FeatureFlagService, PlacementRequestService } from '../../services'
import { PlacementRequestRequestType, PlacementRequestSortField, PlacementRequestStatus } from '../../@types/shared'
import paths from '../../paths/admin'
import { PlacementRequestDashboardSearchOptions } from '../../@types/ui'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { getSearchOptions } from '../../utils/getSearchOptions'

export default class CruDashboardController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly apAreaService: ApAreaService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const status = (req.query.status ? req.query.status : 'notMatched') as PlacementRequestStatus
      const apAreaId = req.query.apArea ? req.query.apArea : res.locals.user.apArea?.id
      const requestType = req.query.requestType as PlacementRequestRequestType

      const apAreas = await this.apAreaService.getApAreas(req.user.token)

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
        req,
        paths.admin.cruDashboard.index({}),
        { status, apArea: apAreaId, requestType },
      )

      const dashboard = await this.placementRequestService.getDashboard(
        req.user.token,
        {
          status,
          apAreaId: apAreaId === 'all' ? undefined : apAreaId,
          requestType,
        },
        pageNumber,
        sortBy,
        sortDirection,
      )

      const showRequestedAndActualArrivalDates = await this.featureFlagService.getBooleanFlag('show-both-arrival-dates')

      console.log(dashboard)

      res.render('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
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
        showRequestedAndActualArrivalDates,
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
        'status',
      ])
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
        req,
        paths.admin.cruDashboard.search({}),
        searchOptions,
      )

      const dashboard = await this.placementRequestService.search(
        req.user.token,
        searchOptions,
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
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
