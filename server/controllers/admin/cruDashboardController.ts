import type { NextFunction, Request, Response, TypedRequestHandler } from 'express'
import {
  Cas1ChangeRequestSortField,
  Cas1CruManagementArea,
  PlacementRequestRequestType,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
} from '@approved-premises/api'
import { PlacementRequestDashboardSearchOptions } from '@approved-premises/ui'
import createError from 'http-errors'
import { CruManagementAreaService, PlacementRequestService, PremisesService } from '../../services'
import adminPaths from '../../paths/admin'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { getSearchOptions } from '../../utils/getSearchOptions'
import { cruDashboardActions, cruDashboardTabItems } from '../../utils/admin/cruDashboardUtils'
import { pagination } from '../../utils/pagination'
import { dashboardTableHeader, dashboardTableRows } from '../../utils/placementRequests/table'
import { placementRequestStatusSelectOptions, tierSelectOptions } from '../../utils/formUtils'
import { changeRequestsTableHeader, changeRequestsTableRows } from '../../utils/placementRequests/changeRequestsUtils'

interface IndexRequest extends Request {
  query: {
    status?: PlacementRequestStatus
    cruManagementArea?: Cas1CruManagementArea['id'] | 'all'
    requestType?: PlacementRequestRequestType
    sortBy?: PlacementRequestSortField
    sortDirection?: SortDirection
    page?: string
  }
}

export default class CruDashboardController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly cruManagementAreaService: CruManagementAreaService,
    private readonly premisesService: PremisesService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: IndexRequest, res: Response, next: NextFunction) => {
      const { user } = res.locals
      const {
        user: { token },
        query: { status = 'notMatched', cruManagementArea = user.cruManagementArea?.id, requestType },
      } = req

      if (!['notMatched', 'unableToMatch', 'matched'].includes(status)) {
        next(createError(404, 'Not found'))
        return
      }

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(token)

      const {
        pageNumber = 1,
        sortBy = status === 'matched' ? 'canonical_arrival_date' : 'expected_arrival',
        sortDirection = 'asc',
        hrefPrefix,
      } = getPaginationDetails<PlacementRequestSortField>(req, adminPaths.admin.cruDashboard.index({}), {
        status,
        cruManagementArea,
        requestType,
      })

      const dashboard = await this.placementRequestService.getDashboard(
        token,
        {
          status,
          cruManagementAreaId: cruManagementArea === 'all' ? undefined : cruManagementArea,
          requestType,
        },
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(res.locals.user),
        cruManagementAreas,
        cruManagementArea,
        requestType,
        activeTab: status,
        tabs: cruDashboardTabItems(user, status, cruManagementArea, requestType),
        tableHead: dashboardTableHeader(status, sortBy, sortDirection, hrefPrefix),
        tableRows: dashboardTableRows(dashboard.data, status),
        pagination: pagination(Number(dashboard.pageNumber), Number(dashboard.totalPages), hrefPrefix),
      })
    }
  }

  changeRequests(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const cruManagementArea: Cas1CruManagementArea['id'] | 'all' =
        req.query.cruManagementArea || user.cruManagementArea?.id
      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(user.token)

      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<Cas1ChangeRequestSortField>(
        req,
        adminPaths.admin.cruDashboard.changeRequests({}),
        { cruManagementArea },
      )

      const changeRequests = await this.placementRequestService.getChangeRequests(
        req.user.token,
        { cruManagementAreaId: cruManagementArea === 'all' ? undefined : cruManagementArea },
        pageNumber,
        sortBy,
        sortDirection,
      )

      res.render('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(user),
        tabs: cruDashboardTabItems(user, 'changeRequests', cruManagementArea),
        activeTab: 'changeRequests',
        cruManagementAreas,
        cruManagementArea,
        tableHead: changeRequestsTableHeader(sortBy || 'name', sortDirection || 'asc', hrefPrefix),
        tableRows: changeRequestsTableRows(changeRequests.data),
        pagination: pagination(Number(changeRequests.pageNumber), Number(changeRequests.totalPages), hrefPrefix),
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
        adminPaths.admin.cruDashboard.search({}),
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
        tabs: cruDashboardTabItems(res.locals.user, 'search'),
        activeTab: 'search',
        ...searchOptions,
        tierOptions: tierSelectOptions(searchOptions.tier),
        statusOptions: placementRequestStatusSelectOptions(searchOptions.status),
        tableHead: dashboardTableHeader(undefined, sortBy, sortDirection, hrefPrefix),
        tableRows: dashboardTableRows(dashboard.data),
        pagination: pagination(Number(dashboard.pageNumber), Number(dashboard.totalPages), hrefPrefix),
      })
    }
  }

  downloadReport(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      return this.premisesService.getOccupancyReport(req.user.token, res)
    }
  }
}
