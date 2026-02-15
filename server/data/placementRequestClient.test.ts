import { WithdrawPlacementRequestReason } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import PlacementRequestClient from './placementRequestClient'
import paths from '../paths/api'

import {
  bookingNotMadeFactory,
  cas1PlacementRequestDetailFactory,
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
} from '../testutils/factories'
import describeClient, { describeCas1NamespaceClient } from '../testutils/describeClient'
import { normaliseCrn } from '../utils/normaliseCrn'

describeClient('placementRequestClient', provider => {
  let placementRequestClient: PlacementRequestClient

  const token = 'test-token'

  beforeEach(() => {
    placementRequestClient = new PlacementRequestClient(token)
  })

  describe('createBooking', () => {
    it('creates and returns a booking', async () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build()
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()
      const newPlacementRequestBooking = newPlacementRequestBookingFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a booking from a placement request',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.booking({ placementRequestId: placementRequest.id }),
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
      const placementRequestId = faker.string.uuid()
      const body = {
        notes: 'some notes',
      }
      const bookingNotMade = bookingNotMadeFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a placement request as not booked',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.bookingNotMade({ placementRequestId }),
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
})

describeCas1NamespaceClient('Cas1PlacementRequestClient', provider => {
  let placementRequestClient: PlacementRequestClient

  const token = 'test-token'

  beforeEach(() => {
    placementRequestClient = new PlacementRequestClient(token)
  })

  describe('dashboard', () => {
    const placementRequests = cas1PlacementRequestDetailFactory.buildList(2)

    it('makes a get request to the placementRequests dashboard endpoint for ready to book requests', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the ready to book placement requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'notMatched', page: '1' },
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

    it('makes a get request to the placementRequests dashboard endpoint for booked requests ', async () => {
      const cruManagementAreaId = 'area-id'
      const requestType = 'standardRelease'
      const status = 'matched'

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the booked placement requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: {
            page: '1',
            requestType,
            cruManagementAreaId,
            status,
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

      const result = await placementRequestClient.dashboard({ cruManagementAreaId, requestType, status })

      expect(result).toEqual({
        data: placementRequests,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('makes a get request to the placementRequests dashboard endpoint for unable to book requests', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the unable to book placement requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'unableToMatch', page: '1' },
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
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests by CRN',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { crnOrName: normaliseCrn('crn123'), page: '1' },
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
      await provider.addInteraction({
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
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the placement requests dashboard view',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.dashboard.pattern,
          query: { status: 'notMatched', page: '2' },
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
      await provider.addInteraction({
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
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a placement request',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
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
})

describeCas1NamespaceClient('Cas1PlacementRequestClient', provider => {
  let placementRequestClient: PlacementRequestClient

  const token = 'test-token'

  beforeEach(() => {
    placementRequestClient = new PlacementRequestClient(token)
  })

  describe('find', () => {
    it('makes a get request to the placementRequest endpoint', async () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a placement request',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
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

  describe('withdraw', () => {
    it('makes a POST request to the withdrawal endpoint', async () => {
      const placementRequestId = 'placement-request-id'
      const reason: WithdrawPlacementRequestReason = 'AlternativeProvisionIdentified'
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a placement request as withdrawn',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.withdrawal.create({ placementRequestId }),
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
