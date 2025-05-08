import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import CruDashboardController from './cruDashboardController'

import { ApplicationService, CruManagementAreaService, PlacementRequestService, PremisesService } from '../../services'
import {
  applicationSummaryFactory,
  cas1ChangeRequestSummaryFactory,
  cruManagementAreaFactory,
  paginatedResponseFactory,
  placementRequestFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { PaginatedResponse } from '../../@types/ui'
import {
  ApplicationSortField,
  Cas1ApplicationSummary,
  Cas1ChangeRequestSummary,
  PlacementRequest,
  PlacementRequestSortField,
} from '../../@types/shared'
import paths from '../../paths/admin'
import * as getPaginationDetails from '../../utils/getPaginationDetails'
import { cruDashboardActions } from '../../utils/admin/cruDashboardUtils'
import { placementRequestTabItems } from '../../utils/placementRequests'
import { dashboardTableHeader, dashboardTableRows } from '../../utils/placementRequests/table'
import { pagination } from '../../utils/pagination'
import {
  pendingPlacementRequestTableHeader,
  pendingPlacementRequestTableRows,
  releaseTypeSelectOptions,
} from '../../utils/applications/utils'
import { placementRequestStatusSelectOptions, tierSelectOptions } from '../../utils/formUtils'
import { createQueryString } from '../../utils/utils'
import { changeRequestsTableHeader, changeRequestsTableRows } from '../../utils/placementRequests/changeRequestsUtils'

describe('CruDashboardController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, query: {} })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const cruManagementAreaService = createMock<CruManagementAreaService>({})
  const applicationService = createMock<ApplicationService>({})
  const premisesService = createMock<PremisesService>({})

  const cruManagementAreas = cruManagementAreaFactory.buildList(5)
  let cruDashboardController: CruDashboardController

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(getPaginationDetails, 'getPaginationDetails')
    cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

    cruDashboardController = new CruDashboardController(
      placementRequestService,
      cruManagementAreaService,
      applicationService,
      premisesService,
    )
  })

  describe('index', () => {
    const indexPath = paths.admin.cruDashboard.index({})
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    beforeEach(() => {
      placementRequestService.getDashboard.mockResolvedValue(paginatedResponse)
    })

    it('should render the default tab with the users CRU management area filtered by default', async () => {
      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status: 'notMatched',
        cruManagementArea: user.cruManagementArea.id,
      })}&`
      const requestHandler = cruDashboardController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(response.locals.user),
        subheading:
          'All applications that have been assessed as suitable and require matching to an AP are listed below',
        activeTab: 'notMatched',
        tabs: placementRequestTabItems('notMatched', user.cruManagementArea.id),
        tableHead: dashboardTableHeader('notMatched', 'name' as PlacementRequestSortField, 'asc', expectedHrefPrefix),
        tableRows: dashboardTableRows(paginatedResponse.data, undefined),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
        cruManagementAreas,
        cruManagementArea: user.cruManagementArea.id,
        requestType: undefined,
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { cruManagementAreaId: user.cruManagementArea.id, requestType: undefined, status: 'notMatched' },
        undefined,
        undefined,
        undefined,
      )

      expect(cruManagementAreaService.getCruManagementAreas).toHaveBeenCalledWith(token)

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(request, indexPath, {
        status: 'notMatched',
        cruManagementArea: user.cruManagementArea.id,
      })
    })

    it('should handle filtering parameters', async () => {
      const requestHandler = cruDashboardController.index()

      const cruManagementArea = 'some-cru-management-area-id'
      const requestType = 'parole'
      const status = 'notMatched'
      const filters = { status, requestType, cruManagementArea }

      const notMatchedRequest = { ...request, query: filters }

      await requestHandler(notMatchedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/index',
        expect.objectContaining({
          activeTab: status,
          cruManagementAreas,
          cruManagementArea,
        }),
      )

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { requestType, status, cruManagementAreaId: cruManagementArea },
        undefined,
        undefined,
        undefined,
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(notMatchedRequest, indexPath, filters)
    })

    it('should not send an area query in the request if the  if the query is "all"', async () => {
      const requestHandler = cruDashboardController.index()

      const cruManagementArea = 'all'
      const filters = { cruManagementArea }
      const requestWithQuery = { ...request, query: filters }

      await requestHandler(requestWithQuery, response, next)

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { status: 'notMatched' },
        undefined,
        undefined,
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/index',
        expect.objectContaining({ cruManagementArea }),
      )
    })

    it('should render the pendingPlacement tab', async () => {
      const requestHandler = cruDashboardController.index()

      const status = 'pendingPlacement'
      const cruManagementArea = 'some-cru-management-area-id'
      const releaseType = 'licence'
      const filters = { cruManagementArea, status, releaseType }
      const requestWithQuery = { ...request, query: filters }

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status,
        cruManagementArea,
      })}&`

      const applications = applicationSummaryFactory.buildList(2)
      const paginatedApplications = paginatedResponseFactory.build({
        data: applications,
      }) as PaginatedResponse<Cas1ApplicationSummary>

      when(applicationService.dashboard)
        .calledWith(token, undefined, undefined, undefined, {
          status: 'pendingPlacementRequest',
          cruManagementAreaId: cruManagementArea,
          releaseType,
        })
        .mockResolvedValue(paginatedApplications)

      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(response.locals.user),
        subheading:
          'All applications that have been accepted but do not yet have an associated placement request are shown below',
        activeTab: 'pendingPlacement',
        tabs: placementRequestTabItems('pendingPlacement', cruManagementArea),
        tableHead: pendingPlacementRequestTableHeader('name' as ApplicationSortField, 'asc', expectedHrefPrefix),
        tableRows: pendingPlacementRequestTableRows(paginatedApplications.data),
        pagination: pagination(
          Number(paginatedApplications.pageNumber),
          Number(paginatedApplications.totalPages),
          expectedHrefPrefix,
        ),
        cruManagementAreas,
        cruManagementArea,
        releaseTypes: releaseTypeSelectOptions(releaseType),
      })
    })
  })

  describe('changeRequests', () => {
    const changeRequestsPath = paths.admin.cruDashboard.changeRequests({})
    const paginatedResponse = paginatedResponseFactory.build({
      data: cas1ChangeRequestSummaryFactory.buildList(5),
    }) as PaginatedResponse<Cas1ChangeRequestSummary>

    beforeEach(() => {
      placementRequestService.getChangeRequests.mockResolvedValue(paginatedResponse)
    })

    it('renders the default view', async () => {
      const expectedHrefPrefix = `${changeRequestsPath}?${createQueryString({
        cruManagementArea: user.cruManagementArea.id,
      })}&`

      const requestHandler = cruDashboardController.changeRequests()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(response.locals.user),
        subheading: 'Requests for changes to placements.',
        activeTab: 'changeRequests',
        tabs: placementRequestTabItems('changeRequests', user.cruManagementArea.id),
        tableHead: changeRequestsTableHeader('name', 'asc', expectedHrefPrefix),
        tableRows: changeRequestsTableRows(paginatedResponse.data),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
        cruManagementAreas,
        cruManagementArea: user.cruManagementArea.id,
      })
    })

    it('renders with filters, pagination and sorting applied', async () => {
      const query = {
        page: '2',
        sortBy: 'tier',
        sortDirection: 'desc',
        cruManagementArea: 'some-other-id',
      }

      const expectedHrefPrefix = `${changeRequestsPath}?${createQueryString({
        cruManagementArea: 'some-other-id',
        sortBy: 'tier',
        sortDirection: 'desc',
      })}&`

      placementRequestService.getChangeRequests.mockResolvedValue({ ...paginatedResponse, pageNumber: '2' })

      const requestHandler = cruDashboardController.changeRequests()

      await requestHandler({ ...request, query }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/index',
        expect.objectContaining({
          tabs: placementRequestTabItems('changeRequests', 'some-other-id'),
          tableHead: changeRequestsTableHeader('tier', 'desc', expectedHrefPrefix),
          pagination: pagination(2, Number(paginatedResponse.totalPages), expectedHrefPrefix),
          cruManagementArea: 'some-other-id',
        }),
      )
    })
  })

  describe('search', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    const searchPath = paths.admin.cruDashboard.search({})

    let searchRequest: Request

    beforeEach(() => {
      placementRequestService.search.mockResolvedValue(paginatedResponse)
    })

    it('should render the search template', async () => {
      const expectedHrefPrefix = `${searchPath}?`
      const requestHandler = cruDashboardController.search()

      searchRequest = { ...request }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        tabs: placementRequestTabItems('search'),
        activeTab: 'search',
        crnOrName: undefined,
        tierOptions: tierSelectOptions(undefined),
        statusOptions: placementRequestStatusSelectOptions(undefined),
        tableHead: dashboardTableHeader(undefined, 'name' as PlacementRequestSortField, 'asc', expectedHrefPrefix),
        tableRows: dashboardTableRows(paginatedResponse.data),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
      })

      expect(placementRequestService.search).toHaveBeenCalledWith(token, {}, undefined, undefined, undefined)

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(searchRequest, searchPath, {})
    })

    it('should search for placement requests by CRN', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = { ...request, query: { crnOrName: 'CRN123' } }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/search',
        expect.objectContaining({
          crnOrName: 'CRN123',
        }),
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(searchRequest, searchPath, {
        crnOrName: 'CRN123',
      })
    })

    it('should search for placement requests by tier and dates', async () => {
      const requestHandler = cruDashboardController.search()
      searchRequest = {
        ...request,
        query: { tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-03' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/search',
        expect.objectContaining({
          tier: 'A1',
          arrivalDateStart: '2022-01-01',
          arrivalDateEnd: '2022-01-03',
        }),
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(searchRequest, searchPath, {
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-03',
      })
    })

    it('should remove empty queries from the search request', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = {
        ...request,
        query: { crnOrName: '', tier: '', arrivalDateStart: '', arrivalDateEnd: '' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/search',
        expect.not.objectContaining({
          crnOrName: undefined,
          tier: 'A1',
          arrivalDateStart: '2022-01-01',
          arrivalDateEnd: '2022-01-03',
        }),
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(searchRequest, searchPath, {})
    })

    it('should request page numbers and sort options', async () => {
      const requestHandler = cruDashboardController.search()

      const crnOrName = 'CRN123'
      const sortBy = 'expectedArrival'
      const sortDirection = 'desc'
      const query = { crnOrName, sortBy, sortDirection, page: '2' }

      searchRequest = {
        ...request,
        query,
      }

      const expectedHrefPrefix = `${searchPath}?${createQueryString({ crnOrName, sortBy, sortDirection })}&`

      placementRequestService.search.mockResolvedValue({ ...paginatedResponse, pageNumber: '2' })

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/search',
        expect.objectContaining({
          crnOrName: 'CRN123',
          pagination: pagination(2, Number(paginatedResponse.totalPages), expectedHrefPrefix),
          tableHead: dashboardTableHeader(
            undefined,
            'expectedArrival' as PlacementRequestSortField,
            'desc',
            expectedHrefPrefix,
          ),
        }),
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(searchRequest, searchPath, {
        crnOrName: 'CRN123',
      })
    })
  })

  describe('downloadReport', () => {
    it('should call the premises client and pipe the report', async () => {
      const requestHandler = cruDashboardController.downloadReport()

      await requestHandler(request, response, next)

      expect(premisesService.getOccupancyReport).toHaveBeenCalled()
    })
  })
})
