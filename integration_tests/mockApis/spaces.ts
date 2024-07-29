import { SuperAgentRequest } from 'superagent'
import paths from '../../server/paths/api'
import { getMatchingRequests, stubFor } from './setup'
import { Cas1SpaceSearchResults } from '../../server/@types/shared'

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
