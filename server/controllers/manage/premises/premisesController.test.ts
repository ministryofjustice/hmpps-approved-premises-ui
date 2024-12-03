import type { PaginatedResponse } from '@approved-premises/ui'
import type { Cas1PremisesSummary, Cas1SpaceBookingSummary } from '@approved-premises/api'
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
  staffMemberFactory,
} from '../../../testutils/factories'

describe('V2PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const premisesController = new PremisesController(premisesService, apAreaService)

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    response = createMock<Response>({ locals: { user: { permissions: ['cas1_space_booking_list'] } } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    const mockSummaryAndPlacements = async (
      query: Record<string, string>,
      premisesSummary: Cas1PremisesSummary = cas1PremisesSummaryFactory.build(),
    ) => {
      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
        totalPages: '1',
      }) as PaginatedResponse<Cas1SpaceBookingSummary>
      const keyworkersList = staffMemberFactory.buildList(5, { keyWorker: true })

      premisesService.find.mockResolvedValue(premisesSummary)
      premisesService.getPlacements.mockResolvedValue(paginatedPlacements)
      premisesService.getKeyworkers.mockResolvedValue(keyworkersList)
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
        keyworkersList,
      }
    }

    it('should render the premises detail and list of placements on the default ("upcoming") tab', async () => {
      const { premisesSummary, paginatedPlacements, keyworkersList } = await mockSummaryAndPlacements({})

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        showPlacements: true,
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
        activeTab: 'upcoming',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=upcoming&',
        placements: paginatedPlacements.data,
        keyworkersList,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getKeyworkers).toHaveBeenCalledWith(token, premisesId)
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
      const { premisesSummary, paginatedPlacements, keyworkersList } = await mockSummaryAndPlacements({
        activeTab: 'current',
      })

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        showPlacements: true,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'asc',
        activeTab: 'current',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=current&',
        placements: paginatedPlacements.data,
        keyworkersList,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getKeyworkers).toHaveBeenCalledWith(token, premisesId)
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
        showPlacements: true,
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'desc',
        activeTab: 'historic',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=historic&',
        placements: paginatedPlacements.data,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getKeyworkers).not.toHaveBeenCalled()
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
      const queryParameters = { sortDirection: 'asc', sortBy: 'personName', activeTab: 'historic' }
      const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({
        ...queryParameters,
        page: '2',
      })

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        showPlacements: true,
        ...queryParameters,
        hrefPrefix: `/manage/premises/some-uuid?activeTab=historic&sortBy=personName&sortDirection=asc&`,
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

    describe.each(['upcoming', 'current'])('when viewing the "%s" tab', activeTab => {
      it('should filter results by keyworker', async () => {
        await mockSummaryAndPlacements({ activeTab, keyworker: 'FOO' })

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/show',
          expect.objectContaining({
            keyworker: 'FOO',
          }),
        )
        expect(premisesService.getPlacements).toHaveBeenCalledWith(
          expect.objectContaining({
            keyWorkerStaffCode: 'FOO',
          }),
        )
      })
    })

    describe('when viewing the "search" tab', () => {
      it.each([
        ['', '/manage/premises/some-uuid?activeTab=search&crnOrName=&'],
        [undefined, '/manage/premises/some-uuid?activeTab=search&'],
      ])(
        'should render the premises detail without fetching the placements when no search has been performed',
        async (crnOrName, hrefPrefix) => {
          const { premisesSummary } = await mockSummaryAndPlacements({
            activeTab: 'search',
            crnOrName,
          })

          expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
            premises: premisesSummary,
            showPlacements: true,
            sortBy: 'canonicalArrivalDate',
            sortDirection: 'desc',
            activeTab: 'search',
            crnOrName,
            pageNumber: undefined,
            totalPages: undefined,
            hrefPrefix,
            placements: undefined,
          })
          expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
          expect(premisesService.getPlacements).not.toHaveBeenCalled()
        },
      )

      it('should render the premises detail and list of placements when a search query is present', async () => {
        const { premisesSummary, paginatedPlacements } = await mockSummaryAndPlacements({
          activeTab: 'search',
          crnOrName: 'X123456',
        })

        expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
          premises: premisesSummary,
          showPlacements: true,
          sortBy: 'canonicalArrivalDate',
          sortDirection: 'desc',
          activeTab: 'search',
          crnOrName: 'X123456',
          pageNumber: 1,
          totalPages: 1,
          hrefPrefix: `/manage/premises/some-uuid?activeTab=search&crnOrName=X123456&`,
          placements: paginatedPlacements.data,
        })
        expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
        expect(premisesService.getPlacements).toHaveBeenCalledWith({
          token,
          premisesId,
          page: 1,
          perPage: 20,
          sortBy: 'canonicalArrivalDate',
          sortDirection: 'desc',
          crnOrName: 'X123456',
        })
      })
    })

    it('should not render the list of placements if the premises does not support space bookings', async () => {
      const { premisesSummary } = await mockSummaryAndPlacements(
        {},
        cas1PremisesSummaryFactory.build({ supportsSpaceBookings: false }),
      )

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        premises: premisesSummary,
        showPlacements: false,
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
        activeTab: 'upcoming',
        pageNumber: undefined,
        totalPages: undefined,
        hrefPrefix: '/manage/premises/some-uuid?activeTab=upcoming&',
        placements: undefined,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).not.toHaveBeenCalled()
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
