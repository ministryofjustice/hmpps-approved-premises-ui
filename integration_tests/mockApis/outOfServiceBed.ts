import { SuperAgentRequest } from 'superagent'

import { getMatchingRequests, stubFor } from './setup'
import { bedspaceConflictResponseBody, errorStub } from './utils'
import paths from '../../server/paths/api'

const headers = { 'Content-Type': 'application/json;charset=UTF-8' }

export default {
  stubOutOfServiceBedCreate: ({ premisesId, outOfServiceBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.manage.premises.outOfServiceBeds.create({ premisesId }),
      },
      response: {
        status: 201,
        headers,
        jsonBody: outOfServiceBed,
      },
    }),

  stubOutOfServiceBedUpdate: ({ outOfServiceBed, premisesId }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.manage.premises.outOfServiceBeds.update({ premisesId, id: outOfServiceBed.id }),
      },
      response: {
        status: 201,
        headers,
        jsonBody: outOfServiceBed,
      },
    }),

  stubUpdateOutOfServiceBedErrors: ({ outOfServiceBed, premisesId }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.manage.premises.outOfServiceBeds.update({ premisesId, id: outOfServiceBed.id }),
      },
      response: {
        status: 400,
        headers,
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

  stubOutOfServiceBedsList: ({ premisesId, outOfServiceBeds }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.manage.premises.outOfServiceBeds.index({ premisesId }),
      },
      response: {
        status: 200,
        headers,
        jsonBody: outOfServiceBeds,
      },
    }),

  stubOutOfServiceBed: ({ premisesId, outOfServiceBed }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.manage.premises.outOfServiceBeds.show({ premisesId, id: outOfServiceBed.id }),
      },
      response: {
        status: 200,
        headers,
        jsonBody: outOfServiceBed,
      },
    }),

  stubOutOfServiceBedConflictError: ({ premisesId, conflictingEntityId, conflictingEntityType }) =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.manage.premises.outOfServiceBeds.create({ premisesId }),
      },
      response: {
        status: 409,
        headers,
        jsonBody: bedspaceConflictResponseBody(conflictingEntityId, conflictingEntityType),
      },
    }),

  stubCancelOutOfServiceBed: ({ outOfServiceBedId, premisesId, outOfServiceBedCancellation }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.manage.premises.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBedId }),
      },
      response: {
        status: 200,
        headers,
        jsonBody: outOfServiceBedCancellation,
      },
    }),
  stubOutOfServiceBedErrors: ({ premisesId, params }): SuperAgentRequest =>
    stubFor(errorStub(params, paths.manage.premises.outOfServiceBeds.index({ premisesId }))),

  verifyOutOfServiceBedCreate: async ({ premisesId }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.manage.premises.outOfServiceBeds.create({ premisesId }),
      })
    ).body.requests,

  verifyOutOfServiceBedUpdate: async ({ premisesId, outOfServiceBed }) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.manage.premises.outOfServiceBeds.update({ premisesId, id: outOfServiceBed.id }),
      })
    ).body.requests,

  verifyOutOfServiceBedCancel: async ({ premisesId, outOfServiceBedId }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.manage.premises.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBedId }),
      })
    ).body.requests,
}
