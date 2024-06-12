import type {
  NewCas1OutOfServiceBed as NewOutOfServiceBed,
  NewCas1OutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedCancellation as OutOfServiceBedCancellation,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  SortDirection,
  UpdateCas1OutOfServiceBed as UpdateOutOfServiceBed,
} from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
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

  async getOutOfServiceBedsForAPremises(token: string, premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)
    const outOfServiceBeds = await outOfServiceBedClient.getAllByPremises(premisesId)

    return outOfServiceBeds
  }

  async getAllOutOfServiceBeds(
    token: string,
    page = 1,
    sortBy: OutOfServiceBedSortField = 'outOfServiceFrom',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)
    const outOfServiceBeds = await outOfServiceBedClient.get(sortBy, sortDirection, page)

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
