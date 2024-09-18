import { Response, SuperAgentRequest } from 'superagent'

import type { LostBed } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import { lostBedReasons } from '../../server/testutils/referenceData/stubs/referenceDataStubs'
import paths from '../../server/paths/api'
import { EntityType } from '../../server/@types/ui'

export default {
  stubLostBedCreate: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedUpdate: (args: { lostBed: LostBed; premisesId: string }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.lostBeds.update({ premisesId: args.premisesId, id: args.lostBed.id }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBed,
      },
    }),

  stubLostBedUpdateErrors: (args: { lostBed: LostBed; premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.premises.lostBeds.update({ premisesId: args.premisesId, id: args.lostBed.id }),
      },
      response: {
        status: 400,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          type: 'https://example.net/validation-error',
          title: 'Invalid request parameters',
          code: 400,
          'invalid-params': [
            {
              propertyName: `$.endDate`,
              errorType: 'empty',
            },
          ],
        },
      },
    }),

  stubLostBedsList: (args: { premisesId: string; lostBeds: Array<LostBed> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.premises.lostBeds.index({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBeds,
      },
    }),

  stubLostBed: (args: { premisesId: string; lostBed: LostBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.premises.lostBeds.show({ premisesId: args.premisesId, id: args.lostBed.id }),
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
    conflictingEntityType: EntityType
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

  stubCancelLostBed: (args: { lostBedId: string; premisesId: string; lostBedCancellation }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, id: args.lostBedId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lostBedCancellation,
      },
    }),
  stubLostBedErrors: (args: { premisesId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, paths.premises.lostBeds.create({ premisesId: args.premisesId }))),

  stubLostBedReferenceData: (): Promise<Response> => stubFor(lostBedReasons),

  verifyLostBedCreate: async (args: { premisesId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.lostBeds.create({ premisesId: args.premisesId }),
      })
    ).body.requests,

  verifyLostBedUpdate: async (args: { premisesId: string; lostBed: LostBed }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.premises.lostBeds.update({ premisesId: args.premisesId, id: args.lostBed.id }),
      })
    ).body.requests,

  verifyLostBedCancel: async (args: { premisesId: string; lostBedId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.premises.lostBeds.cancel({ premisesId: args.premisesId, id: args.lostBedId }),
      })
    ).body.requests,
}
