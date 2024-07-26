import type { PlacementRequest, Cas1SpaceBooking as SpaceBooking } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubSpaceBookingCreate: (args: { placementRequestId: string; spaceBooking: SpaceBooking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.placementRequests.spaceBookings.create({ id: args.placementRequestId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.spaceBooking,
      },
    }),

  verifySpaceBookingCreate: async (placementRequest: PlacementRequest) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.placementRequests.spaceBookings.create({ id: placementRequest.id }),
      })
    ).body.requests,
}
