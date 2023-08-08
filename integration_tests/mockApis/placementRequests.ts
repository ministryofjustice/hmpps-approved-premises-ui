import { SuperAgentRequest } from 'superagent'

import type { PlacementRequest, PlacementRequestDetail, PlacementRequestStatus } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'
import { bookingNotMadeFactory, newPlacementRequestBookingConfirmationFactory } from '../../server/testutils/factories'

export default {
  stubPlacementRequests: (placementRequests: Array<PlacementRequest>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placementRequests.index.pattern,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementRequests,
      },
    }),

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
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.placementRequests.dashboard.pattern}?status=${status}&page=${page}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
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
    }),
  stubPlacementRequestsSearch: ({
    placementRequests,
    crn = '',
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    placementRequests: Array<PlacementRequest>
    crn: string
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

    if (crn) {
      queryParameters.crn = {
        equalTo: crn,
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
        url: `${paths.placementRequests.dashboard.pattern}?status=${status}&page=${page}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
      })
    ).body.requests,
  verifyPlacementRequestsSearch: async ({
    crn,
    page = '1',
    sortBy = 'created_at',
    sortDirection = 'asc',
  }: {
    crn: string
    page: string
    sortBy: string
    sortDirection: string
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.placementRequests.dashboard.pattern,
        queryParameters: {
          crn: {
            equalTo: crn,
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
      },
    }),
  verifyPlacementRequestWithdrawal: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.withdrawal.create({ id: placementRequest.id }),
      })
    ).body.requests,
}
