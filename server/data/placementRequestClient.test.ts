import { WithdrawPlacementRequestReason } from '@approved-premises/api'
import PlacementRequestClient from './placementRequestClient'
import paths from '../paths/api'

import {
  bookingNotMadeFactory,
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
} from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import { normaliseCrn } from '../utils/normaliseCrn'

describeClient('placementRequestClient', provider => {
  let placementRequestClient: PlacementRequestClient

  const token = 'token-1'

  beforeEach(() => {
    placementRequestClient = new PlacementRequestClient(token)
  })

  describe('all', () => {
    it('makes a get request to the placementRequests endpoint', async () => {
      const placementRequests = placementRequestFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all placement requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.index.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
        },
      })

      const result = await placementRequestClient.all()

      expect(result).toEqual(placementRequests)
    })
  })

  describe('dashboard', () => {
    const placementRequests = placementRequestFactory.buildList(2)

    it('makes a get request to the placementRequests dashboard endpoint for unmatched requests', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'notMatched', page: '1', sortBy: 'created_at', sortDirection: 'asc' },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard()

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint for matched requests ', async () => {
      const cruManagementAreaId = 'area-id'
      const requestType = 'standardRelease'
      const status = 'matched'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { page: '1', sortBy: 'created_at', sortDirection: 'asc', requestType, cruManagementAreaId, status },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({ cruManagementAreaId, requestType, status })

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint for requests of another type', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'unableToMatch', page: '1', sortBy: 'created_at', sortDirection: 'asc' },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({ status: 'unableToMatch' })

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint when searching by CRN', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { crnOrName: normaliseCrn('crn123'), page: '1', sortBy: 'created_at', sortDirection: 'asc' },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({ crnOrName: 'CRN123' })

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint when searching by tier and start/end dates', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: {
            tier: 'A1',
            arrivalDateStart: '2020-01-01',
            arrivalDateEnd: '2020-03-01',
            page: '1',
            sortBy: 'created_at',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({
        tier: 'A1',
        arrivalDateStart: '2020-01-01',
        arrivalDateEnd: '2020-03-01',
      })

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint with a page number', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'notMatched', page: '2', sortBy: 'created_at', sortDirection: 'asc' },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({ status: 'notMatched' }, 2)

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '2',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint with a sortBy option', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'notMatched', page: '1', sortBy: 'duration', sortDirection: 'desc' },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await placementRequestClient.dashboard({ status: 'notMatched' }, 1, 'duration', 'desc')

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })
  })

  describe('find', () => {
    it('makes a get request to the placementRequest endpoint', async () => {
      const placementRequestDetail = placementRequestDetailFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a placement request',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.show({ id: placementRequestDetail.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequestDetail,
        },
      })

      const result = await placementRequestClient.find(placementRequestDetail.id)

      expect(result).toEqual(placementRequestDetail)
    })
  })

  describe('createBooking', () => {
    it('creates and returns a booking', async () => {
      const placementRequest = placementRequestFactory.build()
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()
      const newPlacementRequestBooking = newPlacementRequestBookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a booking from a placement request',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.booking({ id: placementRequest.id }),
          body: newPlacementRequestBooking,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookingConfirmation,
        },
      })

      const result = await placementRequestClient.createBooking(placementRequest.id, newPlacementRequestBooking)

      expect(result).toEqual(bookingConfirmation)
    })
  })

  describe('bookingNotMade', () => {
    it('makes a POST request to the booking not made endpoint', async () => {
      const placementRequestId = 'placement-request-id'
      const body = {
        notes: 'some notes',
      }
      const bookingNotMade = bookingNotMadeFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a placement request as not booked',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.bookingNotMade({ id: placementRequestId }),
          body,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookingNotMade,
        },
      })

      const result = await placementRequestClient.bookingNotMade(placementRequestId, body)

      expect(result).toEqual(bookingNotMade)
    })
  })

  describe('withdraw', () => {
    it('makes a POST request to the withdrawal endpoint', async () => {
      const placementRequestId = 'placement-request-id'
      const reason: WithdrawPlacementRequestReason = 'AlternativeProvisionIdentified'
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a placement request as withdrawn',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.withdrawal.create({ id: placementRequestId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: { reason },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await placementRequestClient.withdraw(placementRequestId, reason)
    })
  })
})
