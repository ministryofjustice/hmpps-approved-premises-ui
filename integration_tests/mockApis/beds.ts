import { SuperAgentRequest } from 'superagent'

import type { Cas1PremisesBedSummary, Cas1BedDetail } from '@approved-premises/api'

import { stubFor } from './setup'

import paths from '../../server/paths/api'

export default {
  stubBeds: (args: { premisesId: string; bedSummaries: Array<Cas1PremisesBedSummary> }): SuperAgentRequest =>
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
  stubBed: (args: { premisesId: string; bedDetail: Cas1BedDetail }): SuperAgentRequest =>
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
