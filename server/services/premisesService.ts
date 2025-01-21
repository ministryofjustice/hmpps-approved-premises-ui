import type {
  BedDetail,
  BedSummary,
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1PremisesDaySummary,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingSummarySortField,
  SortDirection,
  StaffMember,
} from '@approved-premises/api'
import type { PremisesFilters } from '@approved-premises/ui'
import type { PremisesClient, RestClientBuilder } from '../data'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getCas1All(token: string, filters: PremisesFilters = {}): Promise<Array<Cas1PremisesBasicSummary>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.allCas1(filters)

    return premises.sort((a, b) => a.name.localeCompare(b.name))
  }

  async getBeds(token: string, premisesId: string): Promise<Array<BedSummary>> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBeds(premisesId)
  }

  async getBed(token: string, premisesId: string, bedId: string): Promise<BedDetail> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBed(premisesId, bedId)
  }

  async getCapacity(
    token: string,
    premisesId: string,
    startDate: string,
    endDate?: string,
  ): Promise<Cas1PremiseCapacity> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getCapacity(premisesId, startDate, endDate || startDate)
  }

  async getDaySummary(args: {
    token: string
    premisesId: string
    date: string
    bookingsCriteriaFilter?: Array<Cas1SpaceBookingCharacteristic>
    sortBy?: Cas1SpaceBookingDaySummarySortField
    sortDirection?: SortDirection
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

  async getStaff(token: string, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getStaff(premisesId)
  }

  async getKeyworkers(token: string, premisesId: string) {
    return this.getStaff(token, premisesId).then(result => result.filter(member => member.keyWorker))
  }
}
