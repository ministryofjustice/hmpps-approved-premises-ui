import { PaginatedResponse } from '@approved-premises/ui'
import { Cas1SpaceBookingSummary } from '@approved-premises/api'
import PremisesClient from './premisesClient'
import paths from '../paths/api'

import { describeCas1NamespaceClient } from '../testutils/describeClient'
import {
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  extendedPremisesSummaryFactory,
  paginatedResponseFactory,
  premisesFactory,
} from '../testutils/factories'

describeCas1NamespaceClient('Cas1PremisesClient', provider => {
  let premisesClient: PremisesClient

  const sampleToken = 'sampleToken'

  beforeEach(() => {
    premisesClient = new PremisesClient(sampleToken)
  })

  describe('find', () => {
    const premises = premisesFactory.build()

    it('should get a single premises', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.show({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${sampleToken}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premises,
        },
      })

      const output = await premisesClient.find(premises.id)
      expect(output).toEqual(premises)
    })
  })

  describe('allCas1', () => {
    it('should get all premises', async () => {
      const gender = 'man'
      const premisesSummaries = cas1PremisesBasicSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all CAS1 premises summaries',
        withRequest: {
          method: 'GET',
          path: paths.premises.indexCas1({ gender }),
          headers: {
            authorization: `Bearer ${sampleToken}`,
            'X-Service-Name': 'approved-premises',
          },
          query: { gender },
        },
        willRespondWith: {
          status: 200,
          body: premisesSummaries,
        },
      })

      const output = await premisesClient.allCas1({ gender })
      expect(output).toEqual(premisesSummaries)
    })
  })

  describe('getPlacements', () => {
    it('should return a list of placements for a premises', async () => {
      const premises = extendedPremisesSummaryFactory.build()
      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
        pageSize: '20',
        totalPages: '2',
        totalResults: '40',
      }) as PaginatedResponse<Cas1SpaceBookingSummary>
      const status = 'current'
      const page = 1
      const sortBy = 'personName'
      const sortDirection = 'asc'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get placements for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.placements({ premisesId: premises.id }),
          query: {
            residency: status,
            sortBy,
            sortDirection,
            page: String(page),
            perPage: paginatedPlacements.pageSize,
          },
          headers: {
            authorization: `Bearer ${sampleToken}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: paginatedPlacements.data,
          headers: {
            'X-Pagination-PageSize': paginatedPlacements.pageSize,
            'X-Pagination-TotalPages': paginatedPlacements.totalPages,
            'X-Pagination-TotalResults': paginatedPlacements.totalResults,
          },
        },
      })

      const output = await premisesClient.getPlacements({
        premisesId: premises.id,
        status,
        page,
        perPage: Number(paginatedPlacements.pageSize),
        sortBy,
        sortDirection,
      })
      expect(output).toEqual(paginatedPlacements)
    })
  })
})
