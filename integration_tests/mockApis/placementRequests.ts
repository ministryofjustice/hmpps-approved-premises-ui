import { SuperAgentRequest } from 'superagent'

import type { PlacementRequest, PlacementRequestDetail } from '@approved-premises/api'
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

  stubPlacementRequestsDashboard: (args: {
    placementRequests: Array<PlacementRequest>
    isParole: boolean
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.placementRequests.dashboard.pattern}?isParole=${args.isParole}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.placementRequests,
      },
    }),
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
}
