import type {
  Cas1BedDetail,
  Cas1CurrentKeyWorker,
  Cas1NationalOccupancyParameters,
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1PremisesBedSummary,
  Cas1PremisesDaySummary,
  Cas1PremisesNewLocalRestriction,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingSummarySortField,
  SortDirection,
} from '@approved-premises/api'
import type { PremisesFilters } from '@approved-premises/ui'
import type { Response } from 'express'
import type { PremisesClient, RestClientBuilder } from '../data'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getCas1All(token: string, filters: PremisesFilters = {}): Promise<Array<Cas1PremisesBasicSummary>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.allCas1(filters)

    return premises.sort((a, b) => a.name.localeCompare(b.name))
  }

  async getBeds(token: string, premisesId: string): Promise<Array<Cas1PremisesBedSummary>> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBeds(premisesId)
  }

  async getBed(token: string, premisesId: string, bedId: string): Promise<Cas1BedDetail> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBed(premisesId, bedId)
  }

  async getCapacity(
    token: string,
    premisesId: string,
    query: {
      startDate: string
      endDate?: string
      excludeSpaceBookingId?: string
    },
  ): Promise<Cas1PremiseCapacity> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getCapacity(
      premisesId,
      query.startDate,
      query.endDate || query.startDate,
      query.excludeSpaceBookingId,
    )
  }

  async getMultipleCapacity(token: string, params: Cas1NationalOccupancyParameters) {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getMultipleCapacity(params)
  }

  async getDaySummary(args: {
    token: string
    premisesId: string
    date: string
    bookingsCriteriaFilter?: Array<Cas1SpaceBookingCharacteristic>
    bookingsSortBy?: Cas1SpaceBookingDaySummarySortField
    bookingsSortDirection?: SortDirection
  }): Promise<Cas1PremisesDaySummary> {
    const { token, ...parameters } = args
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getDaySummary(parameters)
  }

  async find(token: string, id: string): Promise<Cas1Premises> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.find(id)
  }

  async getPlacements(args: {
    token: string
    premisesId: string
    status?: string
    crnOrName?: string
    keyWorkerStaffCode?: string
    keyWorkerUserId?: string
    page: number
    perPage: number
    sortBy: Cas1SpaceBookingSummarySortField
    sortDirection: SortDirection
  }) {
    const { token, ...remainingArgs } = args
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getPlacements(remainingArgs)
  }

  async getPlacement(args: { token: string; premisesId: string; placementId: string }) {
    const { token, ...remainingArgs } = args
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getPlacement(remainingArgs)
  }

  async getCurrentKeyworkers(token: string, premisesId: string): Promise<Array<Cas1CurrentKeyWorker>> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getCurrentKeyworkers(premisesId)
  }

  async getOccupancyReport(token: string, response: Response) {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getOccupancyReport(response)
  }

  async createLocalRestriction(
    token: string,
    premisesId: string,
    newLocalRestriction: Cas1PremisesNewLocalRestriction,
  ): Promise<unknown> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.createLocalRestriction(premisesId, newLocalRestriction)
  }

  async deleteLocalRestriction(token: string, premisesId: string, restrictionId: string): Promise<unknown> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.deleteLocalRestriction(premisesId, restrictionId)
  }
}
