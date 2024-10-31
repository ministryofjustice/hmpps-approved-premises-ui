import { SuperAgentRequest } from 'superagent'
import { Cas1SpaceSearchResults } from '@approved-premises/api'
import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from './setup'

export default {
  stubSpaceSearch: (spaceSearchResults: Cas1SpaceSearchResults): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.match.findSpaces.pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: spaceSearchResults,
      },
    }),

  verifySearchSubmit: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.match.findSpaces.pattern,
      })
    ).body.requests,
}
