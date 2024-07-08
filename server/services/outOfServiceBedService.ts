import type { Cas1ReferenceData } from '@approved-premises/ui'
import type {
  NewCas1OutOfServiceBed as NewOutOfServiceBed,
  NewCas1OutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedCancellation as OutOfServiceBedCancellation,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  SortDirection,
  Temporality,
  UpdateCas1OutOfServiceBed as UpdateOutOfServiceBed,
} from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import type { Cas1ReferenceDataClient, OutOfServiceBedClient, RestClientBuilder } from '../data'
import { Premises } from '../@types/shared'

export type OutOfServiceBedReasons = Array<Cas1ReferenceData>

export default class OutOfServiceBedService {
  constructor(
    private readonly outOfServiceBedClientFactory: RestClientBuilder<OutOfServiceBedClient>,
    private readonly cas1ReferenceDataClientFactory: RestClientBuilder<Cas1ReferenceDataClient>,
  ) {}

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

  async getOutOfServiceBedReasons(token: string): Promise<OutOfServiceBedReasons> {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    const reasons = await cas1ReferenceDataClient.getReferenceData('out-of-service-bed-reasons')

    return reasons
  }

  async getOutOfServiceBedsForAPremises(token: string, premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)
    const outOfServiceBeds = await outOfServiceBedClient.getAllByPremises(premisesId)

    return outOfServiceBeds
  }

  async getAllOutOfServiceBeds({
    token,
    page = 1,
    temporality = 'current',
    sortBy,
    sortDirection,
    premisesId,
    apAreaId,
    perPage = 10,
  }: {
    token: string
    page?: number
    sortBy?: OutOfServiceBedSortField
    sortDirection?: SortDirection
    temporality?: Temporality
    premisesId?: string
    apAreaId?: string
    perPage?: number
  }): Promise<PaginatedResponse<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)
    const outOfServiceBeds = await outOfServiceBedClient.get({
      sortBy,
      sortDirection,
      page,
      temporality,
      premisesId,
      apAreaId,
      perPage,
    })

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
