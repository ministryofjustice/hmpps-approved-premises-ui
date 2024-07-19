import { SuperAgentRequest } from 'superagent'

import type { BedDetail, BedSummary, Cas1SpaceSearchResults as SpaceSearchResults } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from './setup'

import paths from '../../server/paths/api'

export default {
  stubSpaceSearch: (spaceSearchResults: SpaceSearchResults): SuperAgentRequest =>
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
