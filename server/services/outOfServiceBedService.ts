import type { PaginatedResponse } from '@approved-premises/ui'
import type {
  Cas1NewOutOfServiceBed as NewOutOfServiceBed,
  Cas1NewOutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedCancellation as OutOfServiceBedCancellation,
  Cas1OutOfServiceBedReason,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  Premises,
  SortDirection,
  Temporality,
  UpdateCas1OutOfServiceBed as UpdateOutOfServiceBed,
} from '@approved-premises/api'
import type { Cas1ReferenceDataClient, OutOfServiceBedClient, RestClientBuilder } from '../data'

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

    return outOfServiceBedClient.create(premisesId, outOfServiceBed)
  }

  async getOutOfServiceBed(
    token: string,
    premisesId: Premises['id'],
    id: OutOfServiceBed['id'],
  ): Promise<OutOfServiceBed> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    return outOfServiceBedClient.find(premisesId, id)
  }

  async updateOutOfServiceBed(
    token: string,
    id: OutOfServiceBed['id'],
    premisesId: Premises['id'],
    updateOutOfServiceBed: UpdateOutOfServiceBed,
  ): Promise<OutOfServiceBed> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    return outOfServiceBedClient.update(id, updateOutOfServiceBed, premisesId)
  }

  async getOutOfServiceBedReasons(token: string): Promise<Array<Cas1OutOfServiceBedReason>> {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return cas1ReferenceDataClient.getOutOfServiceBedReasons()
  }

  async getOutOfServiceBedsForAPremises(token: string, premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    const outOfServiceBedClient = this.outOfServiceBedClientFactory(token)

    return outOfServiceBedClient.getAllByPremises(premisesId)
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

    return outOfServiceBedClient.get({
      sortBy,
      sortDirection,
      page,
      temporality,
      premisesId,
      apAreaId,
      perPage,
    })
  }

  async cancelOutOfServiceBed(
    token: string,
    premisesId: Premises['id'],
    outOfServiceBedId: OutOfServiceBed['id'],
    data: NewOutOfServiceBedCancellation,
  ): Promise<OutOfServiceBedCancellation> {
    const outOfServiceBedService = this.outOfServiceBedClientFactory(token)

    return outOfServiceBedService.cancel(premisesId, outOfServiceBedId, data)
  }
}
