import type {
  BedDetail,
  BedOccupancyRange,
  BedSummary,
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  DateCapacity,
  ExtendedPremisesSummary,
  ApprovedPremisesSummary as PremisesSummary,
  Room,
  SortDirection,
  StaffMember,
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

  async getRooms(premisesId: string): Promise<Array<Room>> {
    return (await this.restClient.get({ path: paths.premises.rooms({ premisesId }) })) as Array<Room>
  }

  async getRoom(premisesId: string, roomId: string): Promise<Room> {
    return (await this.restClient.get({ path: paths.premises.room({ premisesId, roomId }) })) as Room
  }

  async calendar(premisesId: string, startDate: string, endDate: string): Promise<Array<BedOccupancyRange>> {
    const path = paths.premises.calendar({ premisesId })
    return (await this.restClient.get({
      path,
      query: { startDate, endDate },
    })) as Array<BedOccupancyRange>
  }

  async summary(premisesId: string): Promise<ExtendedPremisesSummary> {
    return (await this.restClient.get({ path: paths.premises.summary({ premisesId }) })) as ExtendedPremisesSummary
  }

  async getPlacements(
    premisesId: string,
    status: string,
    page: number = 1,
    perPage: number = 20,
    sortBy: Cas1SpaceBookingSummarySortField = 'canonicalArrivalDate',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<Cas1SpaceBookingSummary>> {
    return this.restClient.getPaginatedResponse<Cas1SpaceBookingSummary>({
      path: paths.premises.placements({ premisesId }),
      page: page.toString(),
      query: { residency: status, sortBy, sortDirection, perPage },
    })
  }
}
