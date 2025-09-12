import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ProviderTeamSummariesDto } from '../@types/shared/models/ProviderTeamSummariesDto'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'

export default class ProviderClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('providerClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getTeams(providerId: string, username: string): Promise<ProviderTeamSummariesDto> {
    return (await this.get(
      { path: paths.providers.teams({ providerId }) },
      asSystem(username),
    )) as ProviderTeamSummariesDto
  }
}
