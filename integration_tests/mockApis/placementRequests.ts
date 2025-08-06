import { SuperAgentRequest } from 'superagent'

import type {
  Cas1PlacementRequestDetail,
  Cas1PlacementRequestSummary,
  PlacementRequest,
  PlacementRequestStatus,
  RiskTierLevel,
} from '@approved-premises/api'
import { readFileSync } from 'fs'
import path from 'path'
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
    placementRequests: Array<Cas1PlacementRequestSummary>
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
    placementRequests: Array<Cas1PlacementRequestSummary>
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
  stubPlacementRequest: (placementRequestDetail: Cas1PlacementRequestDetail): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
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
        url: paths.placementRequests.booking({ placementRequestId: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: newPlacementRequestBookingConfirmationFactory.build(),
      },
    }),
  stubUnableToMatchPlacementRequest: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.bookingNotMade({ placementRequestId: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bookingNotMadeFactory.build(),
      },
    }),
  stubPlacementRequestWithdrawal: (placementRequest: Cas1PlacementRequestDetail): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.withdrawal.create({ placementRequestId: placementRequest.id }),
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
        url: paths.placementRequests.bookingNotMade({ placementRequestId: placementRequest.id }),
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
        url: paths.placementRequests.withdrawal.create({ placementRequestId: placementRequest.id }),
      })
    ).body.requests,
  verifyPlacementRequestedMarkedUnableToMatch: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.bookingNotMade({ placementRequestId: placementRequest.id }),
      })
    ).body.requests,
  stubOccupancyReportDownload: (args: { filename: string }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.premises.occupancyReport({}),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${args.filename}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', 'fixtures', 'premises-occupancy.csv'), {
          encoding: 'base64',
        }),
      },
    }),

  stubPlacementAppealCreate: (placementRequestId: string) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementRequests.appeal({ placementRequestId }),
      },
      response: {
        status: 200,
      },
    }),

  stubPlannedTransferCreate: (placementRequestId: string) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: paths.placementRequests.plannedTransfer({ placementRequestId }),
      },
      response: {
        status: 200,
      },
    }),

  stubRejectChangeRequest: (params: { placementRequestId: string; changeRequestId: string }) =>
    stubFor({
      request: {
        method: 'PATCH',
        urlPattern: paths.placementRequests.changeRequest(params),
      },
      response: {
        status: 200,
      },
    }),
}
