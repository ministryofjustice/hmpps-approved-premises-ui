import type { Cas1ReferenceDataClient, RestClientBuilder } from '../data'

import { Cas1CruManagementArea } from '../@types/shared'

export default class CruManagementAreaService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<Cas1ReferenceDataClient>) {}

  async getCruManagementAreas(token: string): Promise<Array<Cas1CruManagementArea>> {
    const client = this.referenceDataClientFactory(token)

    return client.getCruManagementAreas()
  }
}
