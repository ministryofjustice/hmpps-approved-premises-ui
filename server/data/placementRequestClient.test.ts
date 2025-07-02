import { PaginatedResponse } from '@approved-premises/ui'
import {
  Cas1ChangeRequestSummary,
  type Cas1NewChangeRequest,
  Cas1RejectChangeRequest,
  WithdrawPlacementRequestReason,
} from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import PlacementRequestClient from './placementRequestClient'
import paths from '../paths/api'

import {
  bookingNotMadeFactory,
  cas1ChangeRequestFactory,
  cas1ChangeRequestSummaryFactory,
  cas1NewChangeRequestFactory,
  cas1PlacementRequestDetailFactory,
  cas1RejectChangeRequestFactory,
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
  paginatedResponseFactory,
  placementRequestFactory,
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
      const placementRequest = placementRequestFactory.build()
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
      const placementRequestId = 'placement-request-id'
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

    it('makes a get request to the placementRequests dashboard endpoint for unmatched requests', async () => {
      await provider.addInteraction({
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

      await provider.addInteraction({
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
      await provider.addInteraction({
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
      await provider.addInteraction({
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
      await provider.addInteraction({
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

  describe('getChangeRequests', () => {
    it('makes a get request to the placementRequests change requests endpoint with default parameters', async () => {
      const paginatedResponse = paginatedResponseFactory.build({
        pageNumber: '1',
        data: cas1ChangeRequestSummaryFactory.buildList(5),
      }) as PaginatedResponse<Cas1ChangeRequestSummary>

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get open change requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.changeRequests.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
          query: {
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
        },
        willRespondWith: {
          status: 200,
          body: paginatedResponse.data,
          headers: {
            'X-Pagination-TotalPages': paginatedResponse.totalPages,
            'X-Pagination-TotalResults': paginatedResponse.totalResults,
            'X-Pagination-PageSize': paginatedResponse.pageSize,
          },
        },
      })

      const result = await placementRequestClient.getChangeRequests()

      expect(result).toEqual(paginatedResponse)
    })

    it('makes a get request to the placementRequests change requests endpoint with specified parameters', async () => {
      const paginatedResponse = paginatedResponseFactory.build({
        pageNumber: '3',
        data: cas1ChangeRequestSummaryFactory.buildList(5),
      }) as PaginatedResponse<Cas1ChangeRequestSummary>

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get open change requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.changeRequests.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
          query: {
            cruManagementAreaId: 'some-id',
            page: '3',
            sortBy: 'tier',
            sortDirection: 'desc',
          },
        },
        willRespondWith: {
          status: 200,
          body: paginatedResponse.data,
          headers: {
            'X-Pagination-TotalPages': paginatedResponse.totalPages,
            'X-Pagination-TotalResults': paginatedResponse.totalResults,
            'X-Pagination-PageSize': paginatedResponse.pageSize,
          },
        },
      })

      const result = await placementRequestClient.getChangeRequests(
        { cruManagementAreaId: 'some-id' },
        3,
        'tier',
        'desc',
      )

      expect(result).toEqual(paginatedResponse)
    })
  })

  describe('getChangeRequest', () => {
    it('makes a get request to retrieve a change request', async () => {
      const changeRequest = cas1ChangeRequestFactory.build()
      const parameters = { placementRequestId: faker.string.uuid(), changeRequestId: changeRequest.id }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a change request',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.changeRequest(parameters),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: changeRequest,
        },
      })

      const result = await placementRequestClient.getChangeRequest(parameters)

      expect(result).toEqual(changeRequest)
    })
  })

  describe('createPlacementAppeal', () => {
    it('creates an appeal change request against a placementRequest', async () => {
      const placementRequestId = faker.string.uuid()
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({ type: 'placementAppeal' })

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create an appeal changeRequest against a placementRequest',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.appeal({ placementRequestId }),
          body: newChangeRequest,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementRequestClient.createPlacementAppeal(placementRequestId, newChangeRequest)
      expect(result).toEqual({})
    })
  })

  describe('createPlannedTransfer', () => {
    it('creates a planned transfer change request against a placementRequest', async () => {
      const placementRequestId = faker.string.uuid()
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({ type: 'plannedTransfer' })

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a planned transfer changeRequest against a placementRequest',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.plannedTransfer({ placementRequestId }),
          body: newChangeRequest,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementRequestClient.createPlannedTransfer(placementRequestId, newChangeRequest)
      expect(result).toEqual({})
    })
  })

  describe('createExtension', () => {
    it('creates an extension change request against a placementRequest', async () => {
      const placementRequestId = faker.string.uuid()
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({ type: 'placementExtension' })
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create an extension changeRequest against a placementRequest',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.extension({ placementRequestId }),
          body: newChangeRequest,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementRequestClient.createExtension(placementRequestId, newChangeRequest)
      expect(result).toEqual({})
    })
  })

  describe('rejectChangeRequest', () => {
    it('rejects a changeRequest against a placementRequest', async () => {
      const placementRequestId = faker.string.uuid()
      const changeRequestId = faker.string.uuid()

      // TODO: remove override once API type corrected - APS-2353
      const rejectChangeRequest: Cas1RejectChangeRequest = cas1RejectChangeRequestFactory.build({
        decisionJson: { notes: { innerKey: 'inner' } },
      })

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to reject a changeRequest against a placementRequest',
        withRequest: {
          method: 'PATCH',
          path: paths.placementRequests.changeRequest({ placementRequestId, changeRequestId }),
          body: rejectChangeRequest,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await placementRequestClient.rejectChangeRequest({
        placementRequestId,
        changeRequestId,
        rejectChangeRequest,
      })

      expect(result).toEqual({})
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
