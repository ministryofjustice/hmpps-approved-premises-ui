import { Response, SuperAgentRequest } from 'superagent'

import type { LostBed } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import { bedspaceConflictResponseBody, errorStub } from '../../wiremock/utils'
import { lostBedReasons } from '../../wiremock/referenceDataStubs'
import paths from '../../server/paths/api'

export default {
  stubLostBedCreate: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBed: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${args.premisesId}/lost-beds/${args.lostBed.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedConflictError: (args: {
    premisesId: string
    conflictingEntityId: string
    conflictingEntityType: 'booking' | 'lost-bed'
  }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingEntityId, args.conflictingEntityType),
      },
    }),
  stubLostBedErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/lost-beds`)),

  stubLostBedReferenceData: (): Promise<Response> => stubFor(lostBedReasons),

  verifyLostBedCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/lost-beds`,
      })
    ).body.requests,
}
