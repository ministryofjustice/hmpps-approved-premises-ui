import { ProviderTeamSummariesDto } from '../@types/shared'
import ProviderClient from '../data/providerClient'

export default class ProviderService {
  constructor(private readonly providerClient: ProviderClient) {}

  async getTeams(providerId: string, username: string): Promise<ProviderTeamSummariesDto> {
    const teams = await this.providerClient.getTeams(providerId, username)

    return teams
  }
}
