import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { ApAreaService, PlacementRequestService } from '../../../services'
import {
  apAreaFactory,
  paginatedResponseFactory,
  placementRequestFactory,
  userDetailsFactory,
} from '../../../testutils/factories'
import placementRequestDetail from '../../../testutils/factories/placementRequestDetail'
import { PaginatedResponse } from '../../../@types/ui'
import { PlacementRequest } from '../../../@types/shared'
import paths from '../../../paths/admin'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'

jest.mock('../../../utils/applications/utils')
jest.mock('../../../utils/applications/getResponses')
jest.mock('../../../utils/getPaginationDetails')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'
  const user = userDetailsFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const apAreaService = createMock<ApAreaService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestsController = new PlacementRequestsController(placementRequestService, apAreaService)
  })

  describe('index', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    const paginationDetails = {
      hrefPrefix: paths.admin.placementRequests.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }

    const apAreas = apAreaFactory.buildList(1)

    beforeEach(() => {
      placementRequestService.getDashboard.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
      apAreaService.getApAreas.mockResolvedValue(apAreas)
    })

    it('should render the placement requests template with the users AP area filtered by default', async () => {
      const requestHandler = placementRequestsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
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
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { apAreaId: user.apArea.id, requestType: undefined, status: 'notMatched' },
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)

      expect(getPaginationDetails).toHaveBeenCalledWith(request, paths.admin.placementRequests.index({}), {
        status: 'notMatched',
        apArea: user.apArea.id,
      })
    })

    it('should handle the parameters', async () => {
      const requestHandler = placementRequestsController.index()

      const apArea = 'some-ap-area-id'
      const requestType = 'parole'
      const status = 'notMatched'
      const filters = { status, requestType, apArea }

      const notMatchedRequest = { ...request, query: filters }

      await requestHandler(notMatchedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
        placementRequests: paginatedResponse.data,
        status,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        apAreas,
        apArea,
        requestType,
      })

      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(
        token,
        { requestType, status, apAreaId: apArea },
        paginationDetails.pageNumber,
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
      )

      expect(getPaginationDetails).toHaveBeenCalledWith(
        notMatchedRequest,
        paths.admin.placementRequests.index({}),
        filters,
      )
    })

    it('should not send an area query in the request if the  if the query is "all"', async () => {
      const requestHandler = placementRequestsController.index()

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

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/index', {
        pageHeading: 'Record and update placement details',
        placementRequests: paginatedResponse.data,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        status: 'notMatched',
        apAreas,
        apArea,
      })
    })
  })

  describe('show', () => {
    it('should render the placement request show template', async () => {
      const placementRequest = placementRequestDetail.build()
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      request.params.id = 'some-uuid'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/show', {
        placementRequest,
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, 'some-uuid')
    })
  })

  describe('search', () => {
    const paginatedResponse = paginatedResponseFactory.build({
      data: placementRequestFactory.buildList(2),
    }) as PaginatedResponse<PlacementRequest>

    const paginationDetails = {
      hrefPrefix: paths.admin.placementRequests.index({}),
      pageNumber: 1,
      sortBy: 'name',
      sortDirection: 'desc',
    }

    const hrefPrefix = paths.admin.placementRequests.search({})

    let searchRequest: Request

    beforeEach(() => {
      placementRequestService.search.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
    })

    it('should render the search template', async () => {
      const requestHandler = placementRequestsController.search()

      searchRequest = { ...request }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
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
      const requestHandler = placementRequestsController.search()

      searchRequest = { ...request, query: { crnOrName: 'CRN123' } }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
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
      const requestHandler = placementRequestsController.search()
      searchRequest = {
        ...request,
        query: { tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-03' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
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
      const requestHandler = placementRequestsController.search()

      searchRequest = {
        ...request,
        query: { crnOrName: '', tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-03' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
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
      const requestHandler = placementRequestsController.search()

      searchRequest = {
        ...request,
        query: { crnOrName: 'CRN123', page: '2', sortBy: 'expectedArrival', sortDirection: 'desc' },
      }

      await requestHandler(searchRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/search', {
        pageHeading: 'Record and update placement details',
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
