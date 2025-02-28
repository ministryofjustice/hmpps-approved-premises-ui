import { PaginatedResponse } from '@approved-premises/ui'
import { Cas1SpaceBooking, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import PremisesClient from './premisesClient'
import paths from '../paths/api'

import { describeCas1NamespaceClient } from '../testutils/describeClient'
import {
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  cas1PremisesFactory,
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
    it.each(['upcoming', 'current', 'historic'] as const)(
      'should return a list of %s placements for a premises',
      async status => {
        const premises = cas1PremisesFactory.build()
        const paginatedPlacements = paginatedResponseFactory.build({
          data: cas1SpaceBookingSummaryFactory.buildList(3),
          pageSize: '20',
          totalPages: '2',
          totalResults: '40',
        }) as PaginatedResponse<Cas1SpaceBookingSummary>
        const page = 1
        const sortBy = 'personName'
        const sortDirection = 'asc'

        provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: `A request to get ${status} placements for a premises`,
          withRequest: {
            method: 'GET',
            path: paths.premises.placements.index({ premisesId: premises.id }),
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
      },
    )

    it('should return a list of all placements matching a keyworker code, or a CRN or name, for a premises', async () => {
      const premises = cas1PremisesFactory.build()
      const paginatedPlacements = paginatedResponseFactory.build({
        data: cas1SpaceBookingSummaryFactory.buildList(3),
        pageSize: '20',
        totalPages: '2',
        totalResults: '40',
      }) as PaginatedResponse<Cas1SpaceBookingSummary>
      const crnOrName = faker.person.firstName()
      const keyWorkerStaffCode = faker.string.alphanumeric(8)
      const page = 1
      const sortBy = 'canonicalArrivalDate'
      const sortDirection = 'desc'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get placements matching "${crnOrName}" for a premises`,
        withRequest: {
          method: 'GET',
          path: paths.premises.placements.index({ premisesId: premises.id }),
          query: {
            crnOrName,
            keyWorkerStaffCode,
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
        crnOrName,
        keyWorkerStaffCode,
        page,
        perPage: Number(paginatedPlacements.pageSize),
        sortBy,
        sortDirection,
      })
      expect(output).toEqual(paginatedPlacements)
    })
  })

  describe('getPlacement', () => {
    it('should return details of a single placement', async () => {
      const premises = cas1PremisesFactory.build()
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single placement',
        withRequest: {
          method: 'GET',
          path: paths.premises.placements.show({ premisesId: premises.id, placementId: placement.id }),
          query: {},
          headers: {
            authorization: `Bearer ${sampleToken}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placement,
        },
      })

      const output = await premisesClient.getPlacement({
        premisesId: premises.id,
        placementId: placement.id,
      })
      expect(output).toEqual(placement)
    })
  })
})
