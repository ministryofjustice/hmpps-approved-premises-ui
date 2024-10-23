import type { Request, Response, TypedRequestHandler } from 'express'
import { ApplicationService, CruManagementAreaService, PlacementRequestService } from '../../services'
import {
  ApplicationSortField,
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

export default class CruDashboardController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly cruManagementAreaService: CruManagementAreaService,
    private readonly applicationService: ApplicationService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const cruManagementAreas = await this.cruManagementAreaService.getCRUManagementAreas(req.user.token)
      const viewArgs =
        req.query.status === 'pendingPlacement'
          ? await this.getPendingApplications(req, res)
          : await this.getPlacementRequests(req, res)

      res.render('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        cruManagementAreas,
        ...viewArgs,
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

  private async getPendingApplications(req: Request, res: Response) {
    const { status } = req.query
    const cruManagementArea: Cas1CruManagementArea['id'] | 'all' =
      req.query.cruManagementArea || res.locals.user.cruManagementArea?.id
    const releaseType = req.query.releaseType as ReleaseTypeOption

    const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationDetails<ApplicationSortField>(
      req,
      adminPaths.admin.cruDashboard.index({}),
      { status, cruManagementArea },
    )
    const applications = await this.applicationService.dashboard(req.user.token, pageNumber, sortBy, sortDirection, {
      status: 'pendingPlacementRequest',
      cruManagementAreaId: cruManagementArea === 'all' ? undefined : cruManagementArea,
      releaseType,
    })

    return {
      status: 'pendingPlacement',
      subheading:
        'All applications that have been accepted but do not yet have an associated placement request are shown below',
      applications: applications.data,
      pageNumber: Number(applications.pageNumber),
      totalPages: Number(applications.totalPages),
      hrefPrefix,
      sortBy,
      sortDirection,
      cruManagementArea,
      releaseType,
    }
  }

  private async getPlacementRequests(req: Request, res: Response) {
    const status = (req.query.status ? req.query.status : 'notMatched') as PlacementRequestStatus
    const cruManagementArea: Cas1CruManagementArea['id'] | 'all' =
      req.query.cruManagementArea || res.locals.user.cruManagementArea?.id
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
      placementRequests: dashboard.data,
      subheading: 'All applications that have been assessed as suitable and require matching to an AP are listed below',
      status,
      cruManagementArea,
      requestType,
      pageNumber: Number(dashboard.pageNumber),
      totalPages: Number(dashboard.totalPages),
      hrefPrefix,
      sortBy,
      sortDirection,
    }
  }
}
