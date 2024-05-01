import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import CruDashboardController from './cruDashboardController'

import { ApAreaService, ApplicationService, FeatureFlagService, PlacementRequestService } from '../../services'
import {
  apAreaFactory,
  applicationSummaryFactory,
  paginatedResponseFactory,
  placementRequestFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { PaginatedResponse } from '../../@types/ui'
import {
  ApplicationSortField,
  ApprovedPremisesApplicationSummary,
  PlacementRequest,
  SortDirection,
} from '../../@types/shared'
import paths from '../../paths/admin'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { retrieveFlag } from '../../middleware/setupFeatureFlags'

jest.mock('../../utils/applications/utils')
jest.mock('../../utils/applications/getResponses')
jest.mock('../../utils/getPaginationDetails')
jest.mock('../../middleware/setupFeatureFlags')

describe('CruDashboardController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const apAreaService = createMock<ApAreaService>({})
  const featureFlagService = createMock<FeatureFlagService>({})
  const applicationService = createMock<ApplicationService>({})

  let cruDashboardController: CruDashboardController

  beforeEach(() => {
    jest.resetAllMocks()
    cruDashboardController = new CruDashboardController(
      placementRequestService,
      apAreaService,
      featureFlagService,
      applicationService,
    )
  })

  describe('index', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    const paginationDetails = {
      hrefPrefix: paths.admin.cruDashboard.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }

    const apAreas = apAreaFactory.buildList(1)

    beforeEach(() => {
      placementRequestService.getDashboard.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
      apAreaService.getApAreas.mockResolvedValue(apAreas)
      when(retrieveFlag).calledWith('show-both-arrival-dates', featureFlagService).mockResolvedValue(true)
    })

    it('should render the placement requests template with the users AP area filtered by default', async () => {
      const requestHandler = cruDashboardController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        subheading:
          'All applications that have been assessed as suitable and require matching to an AP are listed below',
        placementRequests: paginatedResponse.data,
        status: 'notMatched',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        apAreas,
        apArea: user.apArea.id,
        requestType: undefined,
        showRequestedAndActualArrivalDates: true,
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { apAreaId: user.apArea.id, requestType: undefined, status: 'notMatched' },
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)

      expect(getPaginationDetails).toHaveBeenCalledWith(request, paths.admin.cruDashboard.index({}), {
        status: 'notMatched',
        apArea: user.apArea.id,
      })
    })

    it('should handle the parameters', async () => {
      const requestHandler = cruDashboardController.index()

      const apArea = 'some-ap-area-id'
      const requestType = 'parole'
      const status = 'notMatched'
      const filters = { status, requestType, apArea }

      const notMatchedRequest = { ...request, query: filters }

      await requestHandler(notMatchedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'admin/cruDashboard/index',
        expect.objectContaining({
          status,
          apAreas,
          apArea,
        }),
      )

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { requestType, status, apAreaId: apArea },
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(getPaginationDetails).toHaveBeenCalledWith(notMatchedRequest, paths.admin.cruDashboard.index({}), filters)
      expect(retrieveFlag).toHaveBeenCalledWith('show-both-arrival-dates', featureFlagService)
    })

    it('should not send an area query in the request if the  if the query is "all"', async () => {
      const requestHandler = cruDashboardController.index()

      const apArea = 'all'
      const filters = { apArea }
      const requestWithQuery = { ...request, query: filters }

      await requestHandler(requestWithQuery, response, next)

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { status: 'notMatched' },
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', expect.objectContaining({ apArea }))
    })

    it('should handle the pendingPlacement tab', async () => {
      const requestHandler = cruDashboardController.index()

      const apArea = 'some-ap-area-id'
      const filters = { apArea, status: 'pendingPlacement' }
      const requestWithQuery = { ...request, query: filters }

      const applications = applicationSummaryFactory.buildList(2)
      const paginatedApplications = paginatedResponseFactory.build({
        data: applications,
      }) as PaginatedResponse<ApprovedPremisesApplicationSummary>

      when(applicationService.dashboard)
        .calledWith(
          token,
          paginationDetails.pageNumber,
          paginationDetails.sortBy as ApplicationSortField,
          paginationDetails.sortDirection as SortDirection,
          {
            status: 'pendingPlacementRequest',
            apAreaId: apArea,
          },
        )
        .mockResolvedValue(paginatedApplications)

      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/index', {
        pageHeading: 'CRU Dashboard',
        subheading:
          'All applications that have been accepted but do not yet have an associated placement request are shown below',
        status: 'pendingPlacement',
        applications,
        pageNumber: Number(paginatedApplications.pageNumber),
        totalPages: Number(paginatedApplications.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        apAreas,
        apArea,
      })
    })
  })

  describe('search', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    const paginationDetails = {
      hrefPrefix: paths.admin.cruDashboard.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }

    const hrefPrefix = paths.admin.cruDashboard.search({})

    let searchRequest: Request

    beforeEach(() => {
      placementRequestService.search.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
    })

    it('should render the search template', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = { ...request }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        placementRequests: paginatedResponse.data,
        crnOrName: undefined,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })

      expect(placementRequestService.search).toHaveBeenCalledWith(
        token,
        {},
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(getPaginationDetails).toHaveBeenCalledWith(searchRequest, hrefPrefix, {})
    })

    it('should search for placement requests by CRN', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = { ...request, query: { crnOrName: 'CRN123' } }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        placementRequests: paginatedResponse.data,
        crnOrName: 'CRN123',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(searchRequest, hrefPrefix, { crnOrName: 'CRN123' })
    })

    it('should search for placement requests by tier and dates', async () => {
      const requestHandler = cruDashboardController.search()
      searchRequest = {
        ...request,
        query: { tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-03' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        placementRequests: paginatedResponse.data,
        crnOrName: undefined,
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-03',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(searchRequest, hrefPrefix, {
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-03',
      })
    })

    it('should remove empty queries from the search request', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = {
        ...request,
        query: { crnOrName: '', tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-03' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        placementRequests: paginatedResponse.data,
        crnOrName: undefined,
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-03',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(searchRequest, hrefPrefix, {
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-03',
      })
    })

    it('should request page numbers and sort options', async () => {
      const requestHandler = cruDashboardController.search()

      searchRequest = {
        ...request,
        query: { crnOrName: 'CRN123', page: '2', sortBy: 'expectedArrival', sortDirection: 'desc' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/cruDashboard/search', {
        pageHeading: 'CRU Dashboard',
        placementRequests: paginatedResponse.data,
        crnOrName: 'CRN123',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(searchRequest, hrefPrefix, {
        crnOrName: 'CRN123',
      })
    })
  })
})
