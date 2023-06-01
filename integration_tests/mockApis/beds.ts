import { SuperAgentRequest } from 'superagent'

import type { BedDetail, BedSearchResult, BedSummary } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'

import paths from '../../server/paths/api'

export default {
  stubBedSearch: (args: { bedSearchResults: BedSearchResult }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.match.findBeds.pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.bedSearchResults,
      },
    }),

  verifySearchSubmit: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.match.findBeds.pattern,
      })
    ).body.requests,

  stubBeds: (args: { premisesId: string; bedSummaries: Array<BedSummary> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.premises.beds.index({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.bedSummaries,
      },
    }),
  stubBed: (args: { premisesId: string; bedDetail: BedDetail }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.premises.beds.show({ premisesId: args.premisesId, bedId: args.bedDetail.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.bedDetail,
      },
    }),
}
