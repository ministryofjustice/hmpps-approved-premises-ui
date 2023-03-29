import { SuperAgentRequest } from 'superagent'

import type { BedSearchResult } from '@approved-premises/api'

import { stubFor } from '../../wiremock'

import paths from '../../server/paths/match'

export default {
  stubBedSearch: (args: { bedSearchResults: BedSearchResult }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.beds.search.pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.bedSearchResults,
      },
    }),
}
