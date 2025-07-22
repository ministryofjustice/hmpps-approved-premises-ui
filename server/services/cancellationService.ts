import type { ReferenceData } from '@approved-premises/ui'
import type { ReferenceDataClient, RestClientBuilder } from '../data'

export default class CancellationService {
  constructor(private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>) {}

  async getCancellationReasons(token: string): Promise<Array<ReferenceData>> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('cancellation-reasons')

    return reasons.filter(r => r.isActive) as Array<ReferenceData>
  }
}
