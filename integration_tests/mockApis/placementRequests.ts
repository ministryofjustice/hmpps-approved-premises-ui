import { SuperAgentRequest } from 'superagent'

import type { PlacementRequest } from '@approved-premises/api'
import { stubFor } from '../../wiremock'
import paths from '../../server/paths/api'

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
  stubPlacementRequest: (placementRequest: PlacementRequest): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.placementRequests.show({ id: placementRequest.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placementRequest,
      },
    }),
}
