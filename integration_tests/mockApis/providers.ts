import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProviderTeamSummariesDto } from '../../server/@types/shared/models/ProviderTeamSummariesDto'

export default {
  stubGetTeams: (args: { providerId: string; teams: ProviderTeamSummariesDto }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.providers.teams({ providerId: args.providerId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.teams,
      },
    }),
}
