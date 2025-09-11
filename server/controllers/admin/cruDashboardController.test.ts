import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import {
  Cas1ChangeRequestSummary,
  Cas1PlacementRequestSummary,
  PlacementRequestSortField,
  PlacementRequestStatus,
} from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import createError from 'http-errors'
import CruDashboardController from './cruDashboardController'

import { CruManagementAreaService, PlacementRequestService, PremisesService } from '../../services'
import {
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
import { placementRequestStatusSelectOptions, tierSelectOptions } from '../../utils/formUtils'
import { createQueryString } from '../../utils/utils'
import { changeRequestsTableHeader, changeRequestsTableRows } from '../../utils/placementRequests/changeRequestsUtils'

describe('CruDashboardController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, query: {} })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementRequestService = createMock<PlacementRequestService>({})
  const cruManagementAreaService = createMock<CruManagementAreaService>({})
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
      premisesService,
    )
  })

  describe('index', () => {
    const factories = {
      notMatched: cas1PlacementRequestSummaryFactory.notMatched(),
      unableToMatch: cas1PlacementRequestSummaryFactory.unableToMatch(),
      matched: cas1PlacementRequestSummaryFactory.matched(),
    }

    describe.each([
      ['ready to book', 'notMatched'],
      ['unable to book', 'unableToMatch'],
      ['booked', 'matched'],
    ])('when showing the %s tab', (_, status: PlacementRequestStatus) => {
      const basePath = paths.admin.cruDashboard.index({})
      const paginatedResponse = paginatedResponseFactory.build({
        data: factories[status].buildList(2),
        pageNumber: '1',
      }) as PaginatedResponse<Cas1PlacementRequestSummary>
      const defaultHrefPrefix = `${basePath}?${createQueryString({
        status,
        cruManagementArea: user.cruManagementArea.id,
      })}&`

      const defaultRenderParameters = {
        pageHeading: 'CRU Dashboard',
        actions: cruDashboardActions(user),
        activeTab: status,
        tabs: cruDashboardTabItems(user, status, user.cruManagementArea.id),
        tableHead: dashboardTableHeader(status, 'expected_arrival', 'asc', defaultHrefPrefix),
        tableRows: dashboardTableRows(paginatedResponse.data, status),
        pagination: pagination(1, Number(paginatedResponse.totalPages), defaultHrefPrefix),
        cruManagementAreas,
        cruManagementArea: user.cruManagementArea.id,
      }

      beforeEach(() => {
        placementRequestService.getDashboard.mockResolvedValue(paginatedResponse)
      })

      it('should render the tab with the users CRU management area filtered by default', async () => {
        await cruDashboardController.index()({ ...request, query: { status } }, response, next)

        expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', defaultRenderParameters)

        expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
          token,
          { cruManagementAreaId: user.cruManagementArea.id, requestType: undefined, status },
          1,
          'expected_arrival',
          'asc',
        )

        expect(cruManagementAreaService.getCruManagementAreas).toHaveBeenCalledWith(token)

        expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(request, basePath, {
          status,
          cruManagementArea: user.cruManagementArea.id,
        })
      })

      it('should handle sorting and filtering parameters', async () => {
        const cruManagementArea = 'some-cru-management-area-id'
        const requestType = 'parole'
        const sortBy = 'person_risks_tier'
        const sortDirection = 'desc'
        const page = '2'

        const notMatchedRequest = {
          ...request,
          query: { status, requestType, cruManagementArea, sortBy, sortDirection, page },
        }

        placementRequestService.getDashboard.mockResolvedValue({ ...paginatedResponse, pageNumber: '2' })

        await cruDashboardController.index()(notMatchedRequest, response, next)

        const expectedHrefPrefix = `${basePath}?${createQueryString({
          status,
          cruManagementArea,
          requestType,
          sortBy,
          sortDirection,
        })}&`

        expect(getPaginationDetails.getPaginationDetails).toHaveBeenCalledWith(notMatchedRequest, basePath, {
          status,
          requestType,
          cruManagementArea,
        })

        expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
          token,
          { requestType, status, cruManagementAreaId: cruManagementArea },
          Number(page),
          sortBy,
          sortDirection,
        )

        expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
          ...defaultRenderParameters,
          activeTab: status,
          tabs: cruDashboardTabItems(user, status, cruManagementArea, requestType),
          tableHead: dashboardTableHeader(status, sortBy, sortDirection, expectedHrefPrefix),
          pagination: pagination(Number(page), Number(paginatedResponse.totalPages), expectedHrefPrefix),
          cruManagementAreas,
          cruManagementArea,
          requestType,
        })
      })

      it('should not send an area query in the request if the if the query is "all"', async () => {
        const cruManagementArea = 'all'
        const filters = { cruManagementArea, status }
        const requestWithQuery = { ...request, query: filters }

        await cruDashboardController.index()(requestWithQuery, response, next)

        const expectedHrefPrefix = `${basePath}?${createQueryString({
          status,
          cruManagementArea,
        })}&`

        expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
          token,
          { status },
          1,
          'expected_arrival',
          'asc',
        )

        expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
          ...defaultRenderParameters,
          tabs: cruDashboardTabItems(user, status, cruManagementArea),
          tableHead: dashboardTableHeader(status, 'expected_arrival', 'asc', expectedHrefPrefix),
          pagination: pagination(
            Number(paginatedResponse.pageNumber),
            Number(paginatedResponse.totalPages),
            expectedHrefPrefix,
          ),
          cruManagementArea,
        })
      })
    })

    it('should render a 404 if the tab status is invalid', async () => {
      await cruDashboardController.index()({ ...request, query: { status: 'foo' } }, response, next)

      expect(next).toHaveBeenCalledWith(createError(404, 'Not found'))
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
