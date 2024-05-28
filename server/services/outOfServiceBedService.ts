import type {
  NewOutOfServiceBed,
  NewOutOfServiceBedCancellation,
  OutOfServiceBed,
  OutOfServiceBedCancellation,
  UpdateOutOfServiceBed,
} from '@approved-premises/ui'
import type { OutOfServiceBedClient, RestClientBuilder } from '../data'
import { Premises } from '../@types/shared'

export default class OutOfServiceBedService {
  constructor(private readonly outOfServiceBedClientFactory: RestClientBuilder<OutOfServiceBedClient>) {}

  async createOutOfServiceBed(
    token: string,
    premisesId: Premises['id'],
    outOfServiceBed: NewOutOfServiceBed,
  ): Promise<OutOfServiceBed> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    const confirmedOutOfServiceBed = await outOfServiceBedClient.create(premisesId, outOfServiceBed)

    return confirmedOutOfServiceBed
  }

  async getOutOfServiceBed(
    token: string,
    premisesId: Premises['id'],
    id: OutOfServiceBed['id'],
  ): Promise<OutOfServiceBed> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    const outOfServiceBed = await outOfServiceBedClient.find(premisesId, id)

    return outOfServiceBed
  }

  async updateOutOfServiceBed(
    token: string,
    id: OutOfServiceBed['id'],
    premisesId: Premises['id'],
    updateOutOfServiceBed: UpdateOutOfServiceBed,
  ): Promise<OutOfServiceBed> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    const updatedOutOfServiceBed = await outOfServiceBedClient.update(id, updateOutOfServiceBed, premisesId)

    return updatedOutOfServiceBed
  }

  async getOutOfServiceBeds(token: string, premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)
    const outOfServiceBeds = await outOfServiceBedClient.get(premisesId)

    return outOfServiceBeds
  }

  async cancelOutOfServiceBed(
    token: string,
    premisesId: Premises['id'],
    outOfServiceBedId: OutOfServiceBed['id'],
    data: NewOutOfServiceBedCancellation,
  ): Promise<OutOfServiceBedCancellation> {
    const outOfServiceBedService = this.outOfServiceBedClientFactory(token)

    const cancellation = await outOfServiceBedService.cancel(premisesId, outOfServiceBedId, data)

    return cancellation
  }
}
