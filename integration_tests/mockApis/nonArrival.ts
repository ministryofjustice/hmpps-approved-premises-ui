import { SuperAgentRequest } from 'superagent'

import type { Nonarrival } from '@approved-premises/api'

import { ReferenceData } from '@approved-premises/ui'
import { getMatchingRequests, stubFor } from './setup'
import { errorStub } from './utils'

export default {
  stubNonArrivalCreate: (args: { premisesId: string; bookingId: string; nonArrival: Nonarrival }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.nonArrival,
      },
    }),
  stubNonArrivalErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`)),
  verifyNonArrivalCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/non-arrivals`,
      })
    ).body.requests,
  stubNonArrivalReasons: (referenceData: Array<ReferenceData>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/reference-data/non-arrival-reasons`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referenceData,
      },
    }),
}
