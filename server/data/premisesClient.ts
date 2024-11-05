import type {
  BedDetail,
  BedSummary,
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBooking,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  SortDirection,
} from '@approved-premises/api'
import type { PaginatedResponse, PremisesFilters } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async allCas1(filters: PremisesFilters): Promise<Array<Cas1PremisesBasicSummary>> {
    return (await this.restClient.get({
      path: paths.premises.indexCas1({}),
      query: { ...filters },
    })) as Array<Cas1PremisesBasicSummary>
  }

  async find(id: string): Promise<Cas1PremisesSummary> {
    return (await this.restClient.get({ path: paths.premises.show({ premisesId: id }) })) as Cas1PremisesSummary
  }

  async getBeds(premisesId: string): Promise<Array<BedSummary>> {
    return (await this.restClient.get({ path: paths.premises.beds.index({ premisesId }) })) as Array<BedSummary>
  }

  async getBed(premisesId: string, bedId: string): Promise<BedDetail> {
    return (await this.restClient.get({ path: paths.premises.beds.show({ premisesId, bedId }) })) as BedDetail
  }

  async getPlacements(args: {
    premisesId: string
    status: string
    page: number
    perPage: number
    sortBy: Cas1SpaceBookingSummarySortField
    sortDirection: SortDirection
  }): Promise<PaginatedResponse<Cas1SpaceBookingSummary>> {
    const { premisesId, status, page, perPage, sortBy, sortDirection } = args
    return this.restClient.getPaginatedResponse<Cas1SpaceBookingSummary>({
      path: paths.premises.placements.index({ premisesId }),
      page: page.toString(),
      query: { residency: status, sortBy, sortDirection, perPage },
    })
  }

  async getPlacement(args: { premisesId: string; placementId: string }): Promise<Cas1SpaceBooking> {
    return (await this.restClient.get({
      path: paths.premises.placements.show(args),
    })) as Cas1SpaceBooking
  }
}
