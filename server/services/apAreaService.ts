import type { ReferenceDataClient, RestClientBuilder } from '../data'

import { ApArea } from '../@types/shared'

export default class apAreaService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>) {}

  async getApAreas(token: string): Promise<Array<ApArea>> {
    const client = this.referenceDataClientFactory(token)

    return client.getApAreas()
  }
}
