import type { ReferenceDataClient, RestClientBuilder } from '../data'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>) {}

  async getTiers(token: string): Promise<Array<string>> {
    const client = this.referenceDataClientFactory(token)

    return (await client.getTiers()).map(({ tier }) => tier)
  }
}
