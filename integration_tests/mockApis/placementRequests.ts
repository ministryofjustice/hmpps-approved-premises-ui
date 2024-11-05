import { SuperAgentRequest } from 'superagent'

import type {
  PlacementRequest,
  PlacementRequestDetail,
  PlacementRequestStatus,
  RiskTierLevel,
} from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'
import { bookingNotMadeFactory, newPlacementRequestBookingConfirmationFactory } from '../../server/testutils/factories'

export default {
  stubPlacementRequestsDashboard: ({
    placementRequests,
    status,
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    placementRequests: Array<PlacementRequest>
    status: PlacementRequestStatus
    page: string
    sortBy: string
    sortDirection: string
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
      sortBy: {
        equalTo: sortBy,
      },
      sortDirection: {
        equalTo: sortDirection,
      },
    } as Record<string, unknown>

    if (status) {
      queryParameters.status = {
        equalTo: status,
      }
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.placementRequests.dashboard.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: placementRequests,
      },
    })
  },
  stubPlacementRequestsSearch: ({
    placementRequests,
    crnOrName = '',
    status = '',
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    placementRequests: Array<PlacementRequest>
    crnOrName: string
    status: string
    page: string
    sortBy: string
    sortDirection: string
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
      sortBy: {
        equalTo: sortBy,
      },
      sortDirection: {
        equalTo: sortDirection,
      },
    } as Record<string, unknown>

    if (crnOrName) {
      queryParameters.crnOrName = {
        equalTo: crnOrName,
      }
    }
    if (status) {
      queryParameters.status = {
        equalTo: status,
      }
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.placementRequests.dashboard.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: placementRequests,
      },
    })
  },
  verifyPlacementRequestsDashboard: async ({
    status,
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    status: PlacementRequestStatus
    page: string
    sortBy: string
    sortDirection: string
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.placementRequests.dashboard.pattern,
        queryParameters: {
          page: {
            equalTo: page,
          },
          sortBy: {
            equalTo: sortBy,
          },
          sortDirection: {
            equalTo: sortDirection,
          },
          status: {
            equalTo: status,
          },
        },
      })
    ).body.requests,
  verifyPlacementRequestsSearch: async ({
    crnOrName,
    tier,
    arrivalDateStart,
    arrivalDateEnd,
    status,
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    crnOrName: string
    tier: RiskTierLevel
    arrivalDateStart: string
    arrivalDateEnd: string
    status: string
    page: string
    sortBy: string
    sortDirection: string
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.placementRequests.dashboard.pattern,
        queryParameters: {
          crnOrName: {
            equalTo: crnOrName,
          },
          tier: {
            equalTo: tier,
          },
          status: {
            equalTo: status,
          },
          arrivalDateStart: {
            equalTo: arrivalDateStart,
          },
          arrivalDateEnd: {
            equalTo: arrivalDateEnd,
          },
          page: {
            equalTo: page,
          },
          sortBy: {
            equalTo: sortBy,
          },
          sortDirection: {
            equalTo: sortDirection,
          },
        },
      })
    ).body.requests,
  stubPlacementRequest: (placementRequestDetail: PlacementRequestDetail): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placementRequests.show({ id: placementRequestDetail.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementRequestDetail,
      },
    }),
  stubBookingFromPlacementRequest: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.booking({ id: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: newPlacementRequestBookingConfirmationFactory.build(),
      },
    }),
  verifyBookingFromPlacementRequest: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.booking({ id: placementRequest.id }),
      })
    ).body.requests,
  stubUnableToMatchPlacementRequest: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.bookingNotMade({ id: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bookingNotMadeFactory.build(),
      },
    }),
  stubPlacementRequestWithdrawal: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.withdrawal.create({ id: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementRequest,
      },
    }),

  stubPlacementRequestUnableToMatch: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.bookingNotMade({ id: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  verifyPlacementRequestWithdrawal: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.withdrawal.create({ id: placementRequest.id }),
      })
    ).body.requests,
  verifyPlacementRequestedMarkedUnableToMatch: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.bookingNotMade({ id: placementRequest.id }),
      })
    ).body.requests,
}
