import type { PaginatedResponse } from '@approved-premises/ui'
import type { Cas1SpaceBookingSummary } from '@approved-premises/api'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApAreaService, PremisesService } from '../../../services'
import PremisesController from './premisesController'

import {
  apAreaFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  paginatedResponseFactory,
} from '../../../testutils/factories'

describe('V2PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const premisesController = new PremisesController(premisesService, apAreaService)

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    const mockSummaryAndPlacements = async (query: Record<string, string>) => {
      const premisesSummary = cas1PremisesSummaryFactory.build()
      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
        totalPages: '1',
      }) as PaginatedResponse<Cas1SpaceBookingSummary>
      premisesService.find.mockResolvedValue(premisesSummary)
      premisesService.getPlacements.mockResolvedValue(paginatedPlacements)
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        query,
      })

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      return {
        premisesSummary,
        paginatedPlacements,
      }
    }

    it('should render the premises detail and list of placements on the default ("upcoming") tab', async () => {
      const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({})

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
        activeTab: 'upcoming',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=upcoming&',
        placements: paginatedPlacements.data,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).toHaveBeenCalledWith({
        token,
        premisesId,
        status: 'upcoming',
        page: 1,
        perPage: 20,
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
      })
    })

    it('should render the premises detail and list of placements on the "current" tab', async () => {
      const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({ activeTab: 'current' })

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'asc',
        activeTab: 'current',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=current&',
        placements: paginatedPlacements.data,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).toHaveBeenCalledWith({
        token,
        premisesId,
        status: 'current',
        page: 1,
        perPage: 2000,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'asc',
      })
    })

    it('should render the premises detail and list of placements on the "historic" tab', async () => {
      const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({ activeTab: 'historic' })

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'desc',
        activeTab: 'historic',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=historic&',
        placements: paginatedPlacements.data,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).toHaveBeenCalledWith({
        token,
        premisesId,
        status: 'historic',
        page: 1,
        perPage: 20,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'desc',
      })
    })

    it('should render the premises detail and list of placements with specified sort and pagination criteria', async () => {
      const hrefPrefix = `/manage/premises/${premisesId}?activeTab=historic&sortBy=personName&sortDirection=asc&`
      const queryParameters = { sortDirection: 'asc', sortBy: 'personName', activeTab: 'historic', hrefPrefix }

      const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({ ...queryParameters, page: '2' })

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        ...queryParameters,
        pageNumber: 1,
        totalPages: 1,
        placements: paginatedPlacements.data,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).toHaveBeenCalledWith({
        token,
        premisesId,
        status: 'historic',
        page: 2,
        perPage: 20,
        sortBy: 'personName',
        sortDirection: 'asc',
      })
    })
  })

  describe('index', () => {
    it('should render the template with the premises and areas', async () => {
      const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(1)

      const apAreas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(apAreas)
      premisesService.getCas1All.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/index', {
        premisesSummaries,
        areas: apAreas,
        selectedArea: '',
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, undefined)
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })

    it('should call the premises service with the AP area ID if supplied', async () => {
      const areaId = 'ap-area-id'
      const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(1)
      const areas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(areas)
      premisesService.getCas1All.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler({ ...request, body: { selectedArea: areaId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: areaId,
      })

      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, { apAreaId: areaId })
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })
  })
})
