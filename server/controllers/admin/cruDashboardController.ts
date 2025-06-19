import type { Request, Response, TypedRequestHandler } from 'express'
import { ApplicationService, CruManagementAreaService, PlacementRequestService, PremisesService } from '../../services'
import {
  ApplicationSortField,
  Cas1ChangeRequestSortField,
  Cas1CruManagementArea,
  PlacementRequestRequestType,
  PlacementRequestSortField,
  PlacementRequestStatus,
  ReleaseTypeOption,
} from '../../@types/shared'
import adminPaths from '../../paths/admin'
import { PlacementRequestDashboardSearchOptions } from '../../@types/ui'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { getSearchOptions } from '../../utils/getSearchOptions'
import { cruDashboardActions, cruDashboardTabItems } from '../../utils/admin/cruDashboardUtils'
import {
  pendingPlacementRequestTableHeader,
  pendingPlacementRequestTableRows,
  releaseTypeSelectOptions,
} from '../../utils/applications/utils'
import { pagination } from '../../utils/pagination'
import { dashboardTableHeader, dashboardTableRows } from '../../utils/placementRequests/table'
import { placementRequestStatusSelectOptions, tierSelectOptions } from '../../utils/formUtils'
import { changeRequestsTableHeader, changeRequestsTableRows } from '../../utils/placementRequests/changeRequestsUtils'

export default class CruDashboardController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly cruManagementAreaService: CruManagementAreaService,
    private readonly applicationService: ApplicationService,
    private readonly premisesService: PremisesService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(req.user.token)
      const viewArgs =
        req.query.status === 'pendingPlacement'
          ? await this.getPendingApplications(req, res)
          : await this.getPlacementRequests(req, res)

      res.render('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(res.locals.user),
        cruManagementAreas,
        ...viewArgs,
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
        subheading: 'Requests for changes to placements.',
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

  private async getPendingApplications(req: Request, res: Response) {
    const { status } = req.query
    const { user } = res.locals
    const cruManagementArea: Cas1CruManagementArea['id'] | 'all' =
      req.query.cruManagementArea || user.cruManagementArea?.id
    const releaseType = req.query.releaseType as ReleaseTypeOption

    const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationDetails<ApplicationSortField>(
      req,
      adminPaths.admin.cruDashboard.index({}),
      { status, cruManagementArea },
    )
    const applications = await this.applicationService.getAll(req.user.token, pageNumber, sortBy, sortDirection, {
      status: 'pendingPlacementRequest',
      cruManagementAreaId: cruManagementArea === 'all' ? undefined : cruManagementArea,
      releaseType,
    })

    return {
      cruManagementArea,
      releaseTypes: releaseTypeSelectOptions(releaseType),
      activeTab: 'pendingPlacement',
      subheading:
        'All applications that have been accepted but do not yet have an associated placement request are shown below',
      tabs: cruDashboardTabItems(user, 'pendingPlacement', cruManagementArea),
      tableHead: pendingPlacementRequestTableHeader(sortBy, sortDirection, hrefPrefix),
      tableRows: pendingPlacementRequestTableRows(applications.data),
      pagination: pagination(Number(applications.pageNumber), Number(applications.totalPages), hrefPrefix),
    }
  }

  private async getPlacementRequests(req: Request, res: Response) {
    const { user } = res.locals
    const status = (req.query.status ? req.query.status : 'notMatched') as PlacementRequestStatus
    const cruManagementArea: Cas1CruManagementArea['id'] | 'all' =
      req.query.cruManagementArea || user.cruManagementArea?.id
    const requestType = req.query.requestType as PlacementRequestRequestType

    const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<PlacementRequestSortField>(
      req,
      adminPaths.admin.cruDashboard.index({}),
      { status, cruManagementArea, requestType },
    )

    const dashboard = await this.placementRequestService.getDashboard(
      req.user.token,
      {
        status,
        cruManagementAreaId: cruManagementArea === 'all' ? undefined : cruManagementArea,
        requestType,
      },
      pageNumber,
      sortBy,
      sortDirection,
    )

    return {
      cruManagementArea,
      requestType,
      activeTab: status,
      subheading: 'All applications that have been assessed as suitable and require matching to an AP are listed below',
      tabs: cruDashboardTabItems(user, status, cruManagementArea, requestType),
      tableHead: dashboardTableHeader(status, sortBy, sortDirection, hrefPrefix),
      tableRows: dashboardTableRows(dashboard.data, status),
      pagination: pagination(Number(dashboard.pageNumber), Number(dashboard.totalPages), hrefPrefix),
    }
  }

  downloadReport(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      return this.premisesService.getOccupancyReport(req.user.token, res)
    }
  }
}
