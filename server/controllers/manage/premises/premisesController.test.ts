import type { PaginatedResponse } from '@approved-premises/ui'
import type { Cas1SpaceBookingSummary } from '@approved-premises/api'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { CruManagementAreaService, PremisesService, SessionService } from '../../../services'
import PremisesController from './premisesController'

import {
  cas1CurrentKeyworkerFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingSummaryFactory,
  cruManagementAreaFactory,
  paginatedResponseFactory,
  userDetailsFactory,
} from '../../../testutils/factories'
import {
  keyworkersToSelectOptions,
  premisesActions,
  premisesOverbookingSummary,
  PremisesTab,
  premisesTableHead,
  premisesTableRows,
  summaryListForPremises
} from '../../../utils/premises'
import { roleToPermissions } from '../../../utils/users/roles'

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'
  const cruManagementAreas = cruManagementAreaFactory.buildList(4)
  const user = userDetailsFactory.build({
    permissions: roleToPermissions('future_manager'),
    cruManagementArea: cruManagementAreas[2],
  })
  const premisesId = 'some-uuid'
  const referrer = 'referrer/path'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const cruManagementAreaService = createMock<CruManagementAreaService>({})
  const sessionService = createMock<SessionService>({})
  const premisesController = new PremisesController(premisesService, cruManagementAreaService, sessionService)

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    response = createMock<Response>({ locals: { user } })
    jest.useFakeTimers()
    sessionService.getPageBackLink.mockReturnValue(referrer)
  })

  describe('show', () => {
    const paginatedPlacements = paginatedResponseFactory.build({
      data: cas1SpaceBookingSummaryFactory.buildList(3),
      totalPages: '1',
    }) as PaginatedResponse<Cas1SpaceBookingSummary>
    const currentKeyworkers = [
      cas1CurrentKeyworkerFactory.build({ upcomingBookingCount: 2, currentBookingCount: 0 }),
      cas1CurrentKeyworkerFactory.build({ upcomingBookingCount: 0, currentBookingCount: 6 }),
      cas1CurrentKeyworkerFactory.build({ upcomingBookingCount: 2, currentBookingCount: 4 }),
      cas1CurrentKeyworkerFactory.build({ upcomingBookingCount: 0, currentBookingCount: 0 }),
    ]
    const premisesSummary = cas1PremisesFactory.build()

    beforeEach(() => {
      premisesService.find.mockResolvedValue(premisesSummary)
      premisesService.getPlacements.mockResolvedValue(paginatedPlacements)
      premisesService.getCurrentKeyworkers.mockResolvedValue(currentKeyworkers)

      request = createMock<Request>({
        user: { token },
        params: { premisesId },
      })
    })

    it('should render the premises detail and list of placements on the "upcoming" tab', async () => {
      request.query = { activeTab: 'upcoming' }

      await premisesController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/show', {
        backlink: referrer,
        premises: premisesSummary,
        menuActions: premisesActions(user, premisesSummary),
        summaryList: summaryListForPremises(premisesSummary),
        showPlacements: true,
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
        activeTab: 'upcoming',
        pageNumber: 1,
        totalPages: 1,
        hrefPrefix: `/manage/premises/${premisesId}?activeTab=upcoming&`,
        placements: paginatedPlacements.data,
        keyworkersSelectOptions: keyworkersToSelectOptions(currentKeyworkers, 'upcoming'),
        viewSpacesLink: `/manage/premises/${premisesId}/occupancy`,
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCurrentKeyworkers).toHaveBeenCalledWith(token, premisesId)
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

    it('should render the premises detail and list of placements on the default ("current") tab', async () => {
      await premisesController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/show',
        expect.objectContaining({
          premises: premisesSummary,
          showPlacements: true,
          sortBy: 'personName',
          sortDirection: 'asc',
          activeTab: 'current',
          pageNumber: 1,
          totalPages: 1,
          hrefPrefix: `/manage/premises/${premisesId}?activeTab=current&`,
          placements: paginatedPlacements.data,
          keyworkersSelectOptions: keyworkersToSelectOptions(currentKeyworkers, 'current'),
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCurrentKeyworkers).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).toHaveBeenCalledWith({
        token,
        premisesId,
        status: 'current',
        page: 1,
        perPage: 2000,
        sortBy: 'personName',
        sortDirection: 'asc',
      })
    })

    it('should render the premises detail and list of placements on the "historic" tab', async () => {
      request.query = { activeTab: 'historic' }

      await premisesController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/show',
        expect.objectContaining({
          sortBy: 'canonicalDepartureDate',
          activeTab: 'historic',
          hrefPrefix: `/manage/premises/${premisesId}?activeTab=historic&`,
          placements: paginatedPlacements.data,
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCurrentKeyworkers).not.toHaveBeenCalled()
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

      request.query = {
        ...queryParameters,
        page: '2',
      }

      await premisesController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/show',
        expect.objectContaining({
          premises: premisesSummary,
          showPlacements: true,
          ...queryParameters,
          hrefPrefix: `/manage/premises/${premisesId}?activeTab=historic&sortBy=personName&sortDirection=asc&`,
          pageNumber: 1,
          totalPages: 1,
          placements: paginatedPlacements.data,
        }),
      )
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

    describe.each(['upcoming', 'current'])('when viewing the "%s" tab', (activeTab: PremisesTab) => {
      it('should filter results by keyworker', async () => {
        const selectedKeyworkerId = currentKeyworkers[2].summary.id
        request.query = { activeTab, keyworker: selectedKeyworkerId }

        await premisesController.show()(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/show',
          expect.objectContaining({
            keyworker: selectedKeyworkerId,
            keyworkersSelectOptions: keyworkersToSelectOptions(currentKeyworkers, activeTab, selectedKeyworkerId),
          }),
        )
        expect(premisesService.getPlacements).toHaveBeenCalledWith(
          expect.objectContaining({
            keyWorkerUserId: selectedKeyworkerId,
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
          request.query = { activeTab: 'search', crnOrName }

          await premisesController.show()(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'manage/premises/show',
            expect.objectContaining({
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
            }),
          )
          expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
          expect(premisesService.getPlacements).not.toHaveBeenCalled()
        },
      )

      it('should render the premises detail and list of placements when a search query is present', async () => {
        request.query = { activeTab: 'search', crnOrName: 'X123456' }

        await premisesController.show()(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/show',
          expect.objectContaining({
            premises: premisesSummary,
            showPlacements: true,
            sortBy: 'canonicalArrivalDate',
            sortDirection: 'desc',
            activeTab: 'search',
            crnOrName: 'X123456',
            hrefPrefix: `/manage/premises/some-uuid?activeTab=search&crnOrName=X123456&`,
            placements: paginatedPlacements.data,
          }),
        )
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
      const premisesSummaryNoSpaceBookings = cas1PremisesFactory.build({ supportsSpaceBookings: false })
      premisesService.find.mockResolvedValue(premisesSummaryNoSpaceBookings)

      await premisesController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/show',
        expect.objectContaining({
          premises: premisesSummaryNoSpaceBookings,
          showPlacements: false,
          sortBy: 'personName',
          sortDirection: 'asc',
          activeTab: 'current',
          pageNumber: undefined,
          totalPages: undefined,
          hrefPrefix: '/manage/premises/some-uuid?activeTab=current&',
          placements: undefined,
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getPlacements).not.toHaveBeenCalled()
    })
  })

  describe('index', () => {
    const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(1)

    beforeEach(() => {
      premisesService.getCas1All.mockResolvedValue(premisesSummaries)
      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)
    })

    it("should render the template with the premises and CRU management area set to the current user's", async () => {
      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/index', {
        tableHead: premisesTableHead,
        tableRows: premisesTableRows(premisesSummaries),
        areas: cruManagementAreas,
        selectedArea: user.cruManagementArea.id,
      })
      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, {
        cruManagementAreaId: user.cruManagementArea.id,
      })
      expect(cruManagementAreaService.getCruManagementAreas).toHaveBeenCalledWith(token)
    })

    it('should call the premises service with the requested CRU management area ID', async () => {
      const areaId = 'cru-management-area-id'

      const requestHandler = premisesController.index()
      await requestHandler({ ...request, query: { selectedArea: areaId } }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/index',
        expect.objectContaining({
          areas: cruManagementAreas,
          selectedArea: areaId,
        }),
      )
      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, { cruManagementAreaId: areaId })
    })

    it('should let the user see premises from all areas', async () => {
      const areaId = 'all'

      const requestHandler = premisesController.index()
      await requestHandler({ ...request, query: { selectedArea: areaId } }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/index',
        expect.objectContaining({
          areas: cruManagementAreas,
          selectedArea: 'all',
        }),
      )
      expect(premisesService.getCas1All).toHaveBeenCalledWith(token, {})
    })
  })
})
