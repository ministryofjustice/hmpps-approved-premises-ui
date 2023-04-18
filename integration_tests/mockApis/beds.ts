import { SuperAgentRequest } from 'superagent'

import type { BedSearchResult } from '@approved-premises/api'

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
}
