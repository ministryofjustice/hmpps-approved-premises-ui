import type { ManWoman, PaginatedResponse } from '@approved-premises/ui'
import type {
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummary,
  SortDirection,
} from '@approved-premises/api'

import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'
import {
  bedDetailFactory,
  bedSummaryFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  paginatedResponseFactory,
  staffMemberFactory,
} from '../testutils/factories'

jest.mock('../data/premisesClient')
jest.mock('../utils/premises/index')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const premisesClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
  })

  describe('getCas1All', () => {
    it('calls the all method of the premises client and returns the response', async () => {
      const premises = cas1PremisesBasicSummaryFactory.buildList(2)
      premisesClient.allCas1.mockResolvedValue(premises)

      const result = await service.getCas1All(token)

      expect(result).toEqual(premises)
      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.allCas1).toHaveBeenCalled()
    })

    it('supports optional gender parameter', async () => {
      const requestGender: ManWoman = 'man'
      const premises = cas1PremisesBasicSummaryFactory.buildList(2)

      premisesClient.allCas1.mockResolvedValue(premises)
      await service.getCas1All(token, { gender: requestGender })

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.allCas1).toHaveBeenCalledWith({ gender: requestGender })
    })

    it('sorts the premises returned by name', async () => {
      const premisesA = cas1PremisesBasicSummaryFactory.build({ name: 'A' })
      const premisesB = cas1PremisesBasicSummaryFactory.build({ name: 'B' })

      premisesClient.allCas1.mockResolvedValue([premisesB, premisesA])

      const result = await service.getCas1All(token)

      expect(result).toEqual([premisesA, premisesB])
    })
  })

  describe('getBeds', () => {
    it('on success returns the beds given a premises ID', async () => {
      const beds = bedSummaryFactory.buildList(1)
      premisesClient.getBeds.mockResolvedValue(beds)

      const result = await service.getBeds(token, premisesId)

      expect(result).toEqual(beds)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getBeds).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getBed', () => {
    it('on success returns a bed given a premises ID and bed ID', async () => {
      const bed = bedDetailFactory.build()
      premisesClient.getBed.mockResolvedValue(bed)

      const result = await service.getBed(token, premisesId, bed.id)

      expect(result).toEqual(bed)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getBed).toHaveBeenCalledWith(premisesId, bed.id)
    })
  })

  describe('getCapacity', () => {
    const startDate = '2025-05-20'
    const endDate = '2025-12-01'
    const excludeSpaceBookingId = 'excluded-id'

    const premiseCapacity = cas1PremiseCapacityFactory.build()

    beforeEach(() => {
      premisesClient.getCapacity.mockResolvedValue(premiseCapacity)
    })

    it('on success returns capacity given a premises ID', async () => {
      const result = await service.getCapacity(token, premisesId, { startDate, endDate })

      expect(result).toEqual(premiseCapacity)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getCapacity).toHaveBeenCalledWith(premisesId, startDate, endDate, undefined)
    })

    it('returns capacity for one day if a blank end date provided', async () => {
      const result = await service.getCapacity(token, premisesId, { startDate })

      expect(result).toEqual(premiseCapacity)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getCapacity).toHaveBeenCalledWith(premisesId, startDate, startDate, undefined)
    })

    it('can exclude a specific space booking id from the calculations', async () => {
      const result = await service.getCapacity(token, premisesId, { startDate, endDate, excludeSpaceBookingId })

      expect(result).toEqual(premiseCapacity)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getCapacity).toHaveBeenCalledWith(premisesId, startDate, endDate, excludeSpaceBookingId)
    })
  })

  describe('getDaySummary', () => {
    it('should return the day summary for a premises', async () => {
      const daySummary = cas1PremisesDaySummaryFactory.build()
      const params = {
        premisesId,
        date: '2025-05-20',
        bookingsSortBy: 'canonicalArrivalDate' as Cas1SpaceBookingDaySummarySortField,
        bookingsSortDirection: 'asc' as SortDirection,
        bookingsCriteriaFilter: ['isSingle'] as Array<Cas1SpaceBookingCharacteristic>,
      }

      premisesClient.getDaySummary.mockResolvedValue(daySummary)
      const result = await service.getDaySummary({
        token,
        ...params,
      })
      expect(result).toEqual(daySummary)
      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getDaySummary).toHaveBeenCalledWith(params)
    })
  })

  describe('find', () => {
    it('fetches the premises from the client', async () => {
      const premises = cas1PremisesFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.find(token, premises.id)
      expect(result).toEqual(premises)
    })
  })

  describe('getPlacements', () => {
    const paginatedPlacements = paginatedResponseFactory.build({
      data: cas1SpaceBookingSummaryFactory.buildList(3),
    }) as PaginatedResponse<Cas1SpaceBookingSummary>

    beforeEach(() => {
      premisesClient.getPlacements.mockResolvedValue(paginatedPlacements)
    })

    it.each(['upcoming', 'current', 'historic'] as const)(
      'returns the %s placements for a single premises',
      async (status: Cas1SpaceBookingResidency) => {
        const sortBy = 'personName'
        const sortDirection = 'asc'
        const page = 1
        const perPage = 20

        const result = await service.getPlacements({ token, premisesId, status, page, perPage, sortBy, sortDirection })

        expect(result).toEqual(paginatedPlacements)

        expect(premisesClientFactory).toHaveBeenCalledWith(token)
        expect(premisesClient.getPlacements).toHaveBeenCalledWith({
          premisesId,
          status,
          page,
          perPage,
          sortBy,
          sortDirection,
        })
      },
    )

    it('returns placements byCRN or name for a given premises', async () => {
      const crnOrName = 'Foo'
      const sortBy = 'canonicalArrivalDate'
      const sortDirection = 'desc'
      const page = 1
      const perPage = 20

      const result = await service.getPlacements({ token, premisesId, page, perPage, sortBy, sortDirection, crnOrName })

      expect(result).toEqual(paginatedPlacements)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getPlacements).toHaveBeenCalledWith({
        premisesId,
        crnOrName,
        page,
        perPage,
        sortBy,
        sortDirection,
      })
    })

    it('returns placements filtered by keyworker staff code for a given premises', async () => {
      const keyWorkerStaffCode = 'Foo'
      const sortBy = 'canonicalArrivalDate'
      const sortDirection = 'desc'
      const page = 1
      const perPage = 20

      const result = await service.getPlacements({
        token,
        premisesId,
        page,
        perPage,
        sortBy,
        sortDirection,
        keyWorkerStaffCode,
      })

      expect(result).toEqual(paginatedPlacements)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getPlacements).toHaveBeenCalledWith({
        premisesId,
        keyWorkerStaffCode,
        page,
        perPage,
        sortBy,
        sortDirection,
      })
    })
  })

  describe('getPlacement', () => {
    it('returns the details for a single placement', async () => {
      const placement = cas1SpaceBookingFactory.build()
      premisesClient.getPlacement.mockResolvedValue(placement)

      const result = await service.getPlacement({ token, premisesId, placementId: placement.id })

      expect(result).toEqual(placement)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getPlacement).toHaveBeenCalledWith({
        premisesId,
        placementId: placement.id,
      })
    })
  })

  describe('getStaff', () => {
    it('on success returns the list of staff in a premises', async () => {
      const staffList = staffMemberFactory.buildList(5)
      premisesClient.getStaff.mockResolvedValue(staffList)

      const result = await service.getStaff(token, premisesId)

      expect(result).toEqual(staffList)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getStaff).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getKeyworkers', () => {
    it('returns the list of staff filtered for keyworkers in a premises', async () => {
      const keyworker = staffMemberFactory.build({ keyWorker: true })
      const notKeyworker = staffMemberFactory.build({ keyWorker: false })

      premisesClient.getStaff.mockResolvedValue([keyworker, notKeyworker])

      const result = await service.getKeyworkers(token, premisesId)

      expect(result).toEqual([keyworker])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getStaff).toHaveBeenCalledWith(premisesId)
    })
  })
})
