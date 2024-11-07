import type { Cas1SpaceBooking, Cas1SpaceBookingSummary, PlacementRequest } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubSpaceBookingCreate: (args: { placementRequestId: string; spaceBooking: Cas1SpaceBooking }) =>
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

  stubSpaceBookingShow: (placement: Cas1SpaceBooking) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `${paths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id })}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: placement,
      },
    }),

  stubSpaceBookingSummaryList: (args: {
    premisesId: string
    placements: Array<Cas1SpaceBookingSummary>
    pageSize: number
  }) => {
    const pageSize: number = args.pageSize || 20
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `${paths.premises.placements.index({ premisesId: args.premisesId })}.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-PageSize': String(pageSize),
          'X-Pagination-TotalPages': String(Math.ceil(args.placements.length / pageSize)),
          'X-Pagination-TotalResults': String(args.placements.length),
        },
        jsonBody: args.placements.slice(0, pageSize),
      },
    })
  },
}
