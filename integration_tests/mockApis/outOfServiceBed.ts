import { SuperAgentRequest } from 'superagent'

import {
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  SortDirection,
  Temporality,
} from '@approved-premises/api'
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

  stubUpdateOutOfServiceBedErrors: ({ outOfServiceBed, premisesId, params }): SuperAgentRequest =>
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
          'invalid-params': params,
        },
      },
    }),

  stubOutOfServiceBedsList: ({
    outOfServiceBeds,
    premisesId,
    page = 1,
    sortBy,
    sortDirection,
    temporality = 'current',
    perPage = 10,
  }: {
    outOfServiceBeds: Array<OutOfServiceBed>
    premisesId?: string
    page: number
    temporality?: string
    sortBy?: OutOfServiceBedSortField
    sortDirection?: SortDirection
    perPage?: number
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page.toString(),
      },

      temporality: {
        equalTo: temporality,
      },
    } as Record<string, unknown>

    if (premisesId) {
      queryParameters.premisesId = { equalTo: premisesId }
    }
    if (sortBy) {
      queryParameters.sortBy = { equalTo: sortBy }
    }
    if (sortDirection) {
      queryParameters.sortDirection = { equalTo: sortDirection }
    }
    if (perPage) {
      queryParameters.perPage = { equalTo: perPage.toString() }
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.manage.outOfServiceBeds.index.pattern,
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
        jsonBody: outOfServiceBeds,
      },
    })
  },

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
    stubFor(errorStub(params, paths.manage.premises.outOfServiceBeds.premisesIndex({ premisesId }))),

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
  verifyOutOfServiceBedsDashboard: async ({
    page = 1,
    sortBy,
    sortDirection,
    temporality = 'current',
    premisesId,
    perPage = 10,
  }: {
    page: number
    sortBy: OutOfServiceBedSortField
    sortDirection: SortDirection
    temporality: Temporality
    premisesId: string
    perPage?: number
  }) => {
    const queryParameters = {
      page: {
        equalTo: page.toString(),
      },
      temporality: {
        equalTo: temporality,
      },
    } as Record<string, unknown>

    if (premisesId) {
      queryParameters.premisesId = { equalTo: premisesId }
    }
    if (sortBy) {
      queryParameters.sortBy = { equalTo: sortBy }
    }
    if (sortDirection) {
      queryParameters.sortDirection = { equalTo: sortDirection }
    }
    if (perPage) {
      queryParameters.perPage = { equalTo: perPage.toString() }
    }

    const requests = await getMatchingRequests({
      method: 'GET',
      urlPathPattern: paths.manage.outOfServiceBeds.index.pattern,
      queryParameters,
    })

    return requests.body.requests
  },
}
