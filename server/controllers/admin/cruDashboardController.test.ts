import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import {
  ApplicationSortField,
  Cas1ApplicationSummary,
  Cas1ChangeRequestSummary,
  Cas1PlacementRequestSummary,
  PlacementRequestSortField,
} from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import CruDashboardController from './cruDashboardController'

import { ApplicationService, CruManagementAreaService, PlacementRequestService, PremisesService } from '../../services'
import {
  cas1ApplicationSummaryFactory,
  cas1ChangeRequestSummaryFactory,
  cas1PlacementRequestSummaryFactory,
  cruManagementAreaFactory,
  paginatedResponseFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import paths from '../../paths/admin'
import * as getPaginationDetails from '../../utils/getPaginationDetails'
import { cruDashboardActions, cruDashboardTabItems } from '../../utils/admin/cruDashboardUtils'
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
      data: cas1PlacementRequestSummaryFactory.buildList(2),
    }) as PaginatedResponse<Cas1PlacementRequestSummary>
    const defaultHrefPrefix = `${indexPath}?${createQueryString({
      status: 'notMatched',
      cruManagementArea: user.cruManagementArea.id,
    })}&`
    const defaultRenderParameters = {
      pageHeading: 'CRU Dashboard',
      actions: cruDashboardActions(user),
      subheading: 'Applications assessed as suitable, ready to book.',
      activeTab: 'notMatched',
      tabs: cruDashboardTabItems(user, 'notMatched', user.cruManagementArea.id),
      tableHead: dashboardTableHeader('notMatched', 'name' as PlacementRequestSortField, 'asc', defaultHrefPrefix),
      tableRows: dashboardTableRows(paginatedResponse.data, undefined),
      pagination: pagination(
        Number(paginatedResponse.pageNumber),
        Number(paginatedResponse.totalPages),
        defaultHrefPrefix,
      ),
      cruManagementAreas,
      cruManagementArea: user.cruManagementArea.id,
    }

    beforeEach(() => {
      placementRequestService.getDashboard.mockResolvedValue(paginatedResponse)
    })

    it('should render the default tab with the users CRU management area filtered by default', async () => {
      await cruDashboardController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', defaultRenderParameters)

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
      const cruManagementArea = 'some-cru-management-area-id'
      const requestType = 'parole'
      const status = 'notMatched'
      const filters = { status, requestType, cruManagementArea }

      const notMatchedRequest = { ...request, query: filters }

      await cruDashboardController.index()(notMatchedRequest, response, next)

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status,
        cruManagementArea,
        requestType,
      })}&`

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        ...defaultRenderParameters,
        activeTab: status,
        tabs: cruDashboardTabItems(user, status, cruManagementArea, requestType),
        tableHead: dashboardTableHeader(status, 'name' as PlacementRequestSortField, 'asc', expectedHrefPrefix),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
        cruManagementAreas,
        cruManagementArea,
        requestType,
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { requestType, status, cruManagementAreaId: cruManagementArea },
        undefined,
        undefined,
        undefined,
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(notMatchedRequest, indexPath, filters)
    })

    it('should not send an area query in the request if the if the query is "all"', async () => {
      const status = 'notMatched'
      const cruManagementArea = 'all'
      const filters = { cruManagementArea }
      const requestWithQuery = { ...request, query: filters }

      await cruDashboardController.index()(requestWithQuery, response, next)

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status,
        cruManagementArea,
      })}&`

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { status },
        undefined,
        undefined,
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        ...defaultRenderParameters,
        tabs: cruDashboardTabItems(user, status, cruManagementArea),
        tableHead: dashboardTableHeader(status, 'name' as PlacementRequestSortField, 'asc', expectedHrefPrefix),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
        cruManagementArea,
      })
    })

    it('should render the booked tab', async () => {
      await cruDashboardController.index()({ ...request, query: { status: 'matched' } }, response, next)

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status: 'matched',
        cruManagementArea: user.cruManagementArea.id,
      })}&`

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        ...defaultRenderParameters,
        activeTab: 'matched',
        subheading: 'Placements that have been booked.',
        tabs: cruDashboardTabItems(user, 'matched', user.cruManagementArea.id),
        tableHead: dashboardTableHeader('matched', 'name' as PlacementRequestSortField, 'asc', expectedHrefPrefix),
        tableRows: dashboardTableRows(paginatedResponse.data, 'matched'),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { cruManagementAreaId: user.cruManagementArea.id, requestType: undefined, status: 'matched' },
        undefined,
        undefined,
        undefined,
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(request, indexPath, {
        status: 'matched',
        cruManagementArea: user.cruManagementArea.id,
      })
    })

    it('should render the unable to book tab', async () => {
      await cruDashboardController.index()({ ...request, query: { status: 'unableToMatch' } }, response, next)

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status: 'unableToMatch',
        cruManagementArea: user.cruManagementArea.id,
      })}&`

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        ...defaultRenderParameters,
        activeTab: 'unableToMatch',
        subheading: 'Applications that have been marked as unable to book.',
        tabs: cruDashboardTabItems(user, 'unableToMatch', user.cruManagementArea.id),
        tableHead: dashboardTableHeader(
          'unableToMatch',
          'name' as PlacementRequestSortField,
          'asc',
          expectedHrefPrefix,
        ),
        tableRows: dashboardTableRows(paginatedResponse.data, 'unableToMatch'),
        pagination: pagination(
          Number(paginatedResponse.pageNumber),
          Number(paginatedResponse.totalPages),
          expectedHrefPrefix,
        ),
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { cruManagementAreaId: user.cruManagementArea.id, requestType: undefined, status: 'unableToMatch' },
        undefined,
        undefined,
        undefined,
      )

      expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(request, indexPath, {
        status: 'unableToMatch',
        cruManagementArea: user.cruManagementArea.id,
      })
    })

    it('should render the pendingPlacement tab', async () => {
      const status = 'pendingPlacement'
      const cruManagementArea = 'some-cru-management-area-id'
      const releaseType = 'licence'
      const filters = { cruManagementArea, status, releaseType }
      const requestWithQuery = { ...request, query: filters }

      const expectedHrefPrefix = `${indexPath}?${createQueryString({
        status,
        cruManagementArea,
      })}&`

      const applications = cas1ApplicationSummaryFactory.buildList(2)
      const paginatedApplications = paginatedResponseFactory.build({
        data: applications,
      }) as PaginatedResponse<Cas1ApplicationSummary>

      when(applicationService.getAll)
        .calledWith(token, undefined, undefined, undefined, {
          status: 'pendingPlacementRequest',
          cruManagementAreaId: cruManagementArea,
          releaseType,
        })
        .mockResolvedValue(paginatedApplications)

      await cruDashboardController.index()(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        ...defaultRenderParameters,
        activeTab: 'pendingPlacement',
        subheading: 'Applications that have been accepted but do not yet have an associated request for placement.',
        tabs: cruDashboardTabItems(user, 'pendingPlacement', cruManagementArea),
        tableHead: pendingPlacementRequestTableHeader('name' as ApplicationSortField, 'asc', expectedHrefPrefix),
        tableRows: pendingPlacementRequestTableRows(paginatedApplications.data),
        pagination: pagination(
          Number(paginatedApplications.pageNumber),
          Number(paginatedApplications.totalPages),
          expectedHrefPrefix,
        ),
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
        tabs: cruDashboardTabItems(user, 'changeRequests', user.cruManagementArea.id),
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
          tabs: cruDashboardTabItems(user, 'changeRequests', 'some-other-id'),
          tableHead: changeRequestsTableHeader('tier', 'desc', expectedHrefPrefix),
          pagination: pagination(2, Number(paginatedResponse.totalPages), expectedHrefPrefix),
          cruManagementArea: 'some-other-id',
        }),
      )
    })
  })

  describe('search', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: cas1PlacementRequestSummaryFactory.buildList(2),
    }) as PaginatedResponse<Cas1PlacementRequestSummary>

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
        tabs: cruDashboardTabItems(user, 'search'),
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
