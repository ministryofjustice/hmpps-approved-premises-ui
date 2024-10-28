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
  paginatedResponseFactory,
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

  describe('getPlacements', () => {
    it('returns the placements for a single premises', async () => {
      const status = 'upcoming'
      const sortBy = 'personName'
      const sortDirection = 'asc'
      const page = 1
      const perPage = 20

      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
      }) as PaginatedResponse<Cas1SpaceBookingSummary>

      premisesClient.getPlacements.mockResolvedValue(paginatedPlacements)

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
    })
  })

  describe('getPlacements', () => {
    it('returns the placements for a particular premesis', async () => {
      const status = 'upcoming'
      const sortBy = 'personName'
      const sortDirection = 'asc'

      const placements = cas1SpaceBookingSummaryFactory.buildList(10)

      premisesClient.getPlacements.mockResolvedValue(placements)

      const result = await service.getPlacements(token, premisesId, status, sortBy, sortDirection)

      expect(result).toEqual(placements)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getPlacements).toHaveBeenCalledWith(premisesId, status, sortBy, sortDirection)
    })
  })
})
