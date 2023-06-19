import type { ReferenceData } from '@approved-premises/ui'
import type { LostBed, NewLostBed, UpdateLostBed } from '@approved-premises/api'
import type { LostBedClient, ReferenceDataClient, RestClientBuilder } from '../data'

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

  async getLostBed(token: string, premisesId: string, id: string): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(token)

    const lostBed = await lostBedClient.find(premisesId, id)

    return lostBed
  }

  async updateLostBed(token: string, id: string, premisesId: string, updateLostBed: UpdateLostBed): Promise<LostBed> {
    const lostBedClient = this.lostBedClientFactory(token)

    const updatedLostBed = await lostBedClient.update(id, updateLostBed, premisesId)

    return updatedLostBed
  }

  async getLostBeds(token: string, premisesId: string): Promise<Array<LostBed>> {
    const lostBedClient = this.lostBedClientFactory(token)
    const lostBeds = await lostBedClient.get(premisesId)

    return lostBeds
  }

  async getReferenceData(token: string): Promise<LostBedReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const reasons = await referenceDataClient.getReferenceData('lost-bed-reasons')

    return reasons
  }
}
