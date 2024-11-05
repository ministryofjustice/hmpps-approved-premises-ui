import type {
  BedDetail,
  BedSummary,
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBookingSummarySortField,
  ExtendedPremisesSummary,
  SortDirection,
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

  async getPlacements(args: {
    token: string
    premisesId: string
    status: string
    page: number
    perPage: number
    sortBy: Cas1SpaceBookingSummarySortField
    sortDirection: SortDirection
  }) {
    const { token, ...remainingArgs } = args
    const premisesClient = this.premisesClientFactory(token)
    return premisesClient.getPlacements(remainingArgs)
  }
}
