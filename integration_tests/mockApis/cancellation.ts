import type { SuperAgentRequest } from 'superagent'
import type { Cancellation } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import { errorStub } from './utils'

import { cancellationReasons } from '../../server/testutils/referenceData/stubs/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),

  stubCancellationCreate: (args: {
    premisesId: string
    bookingId?: string
    placementId?: string
    cancellation: Cancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: args.bookingId
          ? `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`
          : `/cas1/premises/${args.premisesId}/space-bookings/${args.placementId}/cancellations`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.cancellation,
      },
    }),
  stubCancellationErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`)),

  verifyCancellationCreate: async (args: { premisesId: string; bookingId: string; cancellation: Cancellation }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`,
      })
    ).body.requests,

  verifySpaceBookingCancellationCreate: async (args: {
    premisesId: string
    placementId: string
    cancellation: Cancellation
  }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/cas1/premises/${args.premisesId}/space-bookings/${args.placementId}/cancellations`,
      })
    ).body.requests,
}
