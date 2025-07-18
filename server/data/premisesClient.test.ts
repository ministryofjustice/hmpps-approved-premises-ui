import {
  Cas1SpaceBooking,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingSummary,
  SortDirection,
} from '@approved-premises/api'
import type { PaginatedResponse } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import {
  cas1BedDetailFactory,
  cas1NationalOccupancyFactory,
  cas1NationalOccupancyParametersFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesBedSummaryFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  paginatedResponseFactory,
  staffMemberFactory,
} from '../testutils/factories'
import PremisesClient from './premisesClient'
import paths from '../paths/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'

const token = 'test-token-1'

describeCas1NamespaceClient('PremisesCas1Client', provider => {
  let premisesClient: PremisesClient
  const premises = cas1PremisesFactory.build()

  beforeEach(() => {
    premisesClient = new PremisesClient(token)
  })

  describe('find', () => {
    it('should get a single premises', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.show({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
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

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all CAS1 premises summaries',
        withRequest: {
          method: 'GET',
          path: paths.premises.index({ gender }),
          headers: {
            authorization: `Bearer ${token}`,
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
        const paginatedPlacements = paginatedResponseFactory.build({
          data: cas1SpaceBookingSummaryFactory.buildList(3),
          pageSize: '20',
          totalPages: '2',
          totalResults: '40',
        }) as PaginatedResponse<Cas1SpaceBookingSummary>
        const page = 1
        const sortBy = 'personName'
        const sortDirection = 'asc'

        await provider.addInteraction({
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
              authorization: `Bearer ${token}`,
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

      await provider.addInteraction({
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
            authorization: `Bearer ${token}`,
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
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single placement',
        withRequest: {
          method: 'GET',
          path: paths.premises.placements.show({ premisesId: premises.id, placementId: placement.id }),
          query: {},
          headers: {
            authorization: `Bearer ${token}`,
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

  describe('getBeds', () => {
    it('should return a list of beds for a given premises', async () => {
      const beds = cas1PremisesBedSummaryFactory.buildList(5)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of beds for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.beds.index({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: beds,
        },
      })

      const output = await premisesClient.getBeds(premises.id)
      expect(output).toEqual(beds)
    })
  })

  describe('getBed', () => {
    it('should return a bed for a given premises', async () => {
      const bed = cas1BedDetailFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a bed for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.beds.show({ premisesId: premises.id, bedId: bed.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bed,
        },
      })

      const output = await premisesClient.getBed(premises.id, bed.id)
      expect(output).toEqual(bed)
    })
  })

  describe('getCapacity', () => {
    it('should return capacity data for a given premises', async () => {
      const startDate = '2025-03-14'
      const endDate = '2025-11-11'
      const excludeSpaceBookingId = 'id-to-exclude'
      const premiseCapacity = cas1PremiseCapacityFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the capacity of a premise',
        withRequest: {
          method: 'GET',
          path: paths.premises.capacity({ premisesId: premises.id }),
          query: {
            startDate,
            endDate,
            excludeSpaceBookingId,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premiseCapacity,
        },
      })

      const output = await premisesClient.getCapacity(premises.id, startDate, endDate, excludeSpaceBookingId)
      expect(output).toEqual(premiseCapacity)
    })
  })

  describe('getMultipleCapacity', () => {
    it('should retrieve the capacity for several premises', async () => {
      const parameters = cas1NationalOccupancyParametersFactory.build()
      const response = cas1NationalOccupancyFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the capacity for a set of premises',
        withRequest: {
          method: 'POST',
          body: parameters,
          path: paths.premises.nationalCapacity({}),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: response,
        },
      })

      const result = await premisesClient.getMultipleCapacity(parameters)

      expect(result).toEqual(response)
    })
  })

  describe('getDaySummary', () => {
    it('should return capacity and occupancy data for a given premises for a given day', async () => {
      const date = '2025-03-14'
      const premiseCapacity = cas1PremisesDaySummaryFactory.build()
      const bookingsSortDirection: SortDirection = 'asc'
      const bookingsSortBy: Cas1SpaceBookingDaySummarySortField = 'personName'

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the day summary of a premise',
        withRequest: {
          method: 'GET',
          path: paths.premises.daySummary({ premisesId: premises.id, date }),
          query: {
            bookingsSortDirection,
            bookingsSortBy,
            bookingsCriteriaFilter: 'hasEnSuite',
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premiseCapacity,
        },
      })

      const output = await premisesClient.getDaySummary({
        premisesId: premises.id,
        date,
        bookingsSortDirection,
        bookingsSortBy,
        bookingsCriteriaFilter: ['hasEnSuite'],
      })
      expect(output).toEqual(premiseCapacity)
    })
  })

  describe('getStaff', () => {
    it('should return a list of staff for a given premises', async () => {
      const staffList = staffMemberFactory.buildList(5)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of staff for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.staffMembers.index({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: staffList,
        },
      })

      const output = await premisesClient.getStaff(premises.id)
      expect(output).toEqual(staffList)
    })
  })

  describe('getOccupancyReport', () => {
    it('should pipe the occupancy report', async () => {
      const response = createMock<Response>({})

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to download the occupancy report',
        withRequest: {
          method: 'GET',
          path: paths.premises.occupancyReport({}),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await premisesClient.getOccupancyReport(response)
    })
  })
})
