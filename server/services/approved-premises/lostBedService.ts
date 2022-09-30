import type { LostBed, NewLostBed, ReferenceData } from 'approved-premises'
import { RestClientBuilder } from '../../data'
import type { LostBedClient, ReferenceDataClient } from '../../data/approved-premises'

export type LostBedReferenceData = Array<ReferenceData>
export default class LostBedService {
  constructor(
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createLostBed(token: string, premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(token)

    const confirmedLostBed = await lostBedClient.create(premisesId, lostBed)

    return confirmedLostBed
  }

  async getReferenceData(token: string): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
