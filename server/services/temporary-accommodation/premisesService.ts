import type { NewPremises, Premises } from 'temporary-accommodation'
import { RestClientBuilder } from '../../data'
import { PremisesClient } from '../../data/temporary-accommodation'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async create(token: string, newPremises: NewPremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.create(newPremises)

    return premises
  }
}
