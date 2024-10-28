import type {
  BedDetail,
  BedSummary,
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBookingSummarySortField,
  ExtendedPremisesSummary,
  Room,
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

  async find(token: string, id: string): Promise<Cas1PremisesSummary> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)

    return premises
  }

  async getPremisesDetails(token: string, id: string): Promise<ExtendedPremisesSummary> {
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.summary(id)
  }

  async getOccupancy(token: string, premisesId: string, startDate: string, endDate: string) {
    const premisesClient = this.premisesClientFactory(token)
    const apiOccupancy = await premisesClient.calendar(premisesId, startDate, endDate)
    const occupancyForUi = await mapApiOccupancyToUiOccupancy(apiOccupancy)

    return occupancyForUi
  }

  async getPlacements(
    token: string,
    premisesId: string,
    status: string,
    sortBy: Cas1SpaceBookingSummarySortField,
    sortDirection: SortDirection,
  ) {
    const premisesClient = this.premisesClientFactory(token)
    const result = await premisesClient.getPlacements(premisesId, status, sortBy, sortDirection)
    return result
  }
}
