import type { ManWoman, PaginatedResponse } from '@approved-premises/ui'
import type { Cas1SpaceBookingSummary } from '@approved-premises/api'

import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'
import {
  bedDetailFactory,
  bedSummaryFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  extendedPremisesSummaryFactory,
  paginatedResponseFactory,
  roomFactory,
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

  describe('find', () => {
    it('fetches the premises from the client', async () => {
      const premises = cas1PremisesSummaryFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.find(token, premises.id)
      expect(result).toEqual(premises)
    })
  })

  describe('getPremisesDetails', () => {
    it('returns a title and a summary list for a given Premises ID', async () => {
      const premises = extendedPremisesSummaryFactory.build()
      premisesClient.summary.mockResolvedValue(premises)

      const result = await service.getPremisesDetails(token, premises.id)

      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.summary).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getOccupancy', () => {
    it('returns the premises occupancy from the client', async () => {
      const occupancy = bedOccupancyRangeFactory.buildList(1)
      const startDate = '2020-01-01'
      const endDate = '2020-01-31'

      premisesClient.calendar.mockResolvedValue(occupancy)
      ;(mapApiOccupancyToUiOccupancy as jest.Mock).mockReturnValue(occupancy)

      const result = await service.getOccupancy(token, premisesId, startDate, endDate)

      expect(result).toEqual(occupancy)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.calendar).toHaveBeenCalledWith(premisesId, startDate, endDate)
    })
  })

  describe('getPlacements', () => {
    it('returns the placements for a single premesis', async () => {
      const status = 'upcoming'
      const sortBy = 'personName'
      const sortDirection = 'asc'
      const page = 1
      const perPage = 20

      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
      }) as PaginatedResponse<Cas1SpaceBookingSummary>

      premisesClient.getPlacements.mockResolvedValue(paginatedPlacements)

      const result = await service.getPlacements(token, premisesId, status, page, perPage, sortBy, sortDirection)

      expect(result).toEqual(paginatedPlacements)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getPlacements).toHaveBeenCalledWith(
        premisesId,
        status,
        page,
        perPage,
        sortBy,
        sortDirection,
      )
    })
  })
})
