import type {
  ApprovedPremises,
  BedDetail,
  BedOccupancyRange,
  BedSummary,
  DateCapacity,
  ExtendedPremisesSummary,
  ApprovedPremisesSummary as PremisesSummary,
  Room,
  StaffMember,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(apAreaId: string = ''): Promise<Array<PremisesSummary>> {
    const query = apAreaId ? { apAreaId } : {}
    return (await this.restClient.get({
      path: paths.premises.index({}),
      query,
    })) as Array<PremisesSummary>
  }

  async find(id: string): Promise<ApprovedPremises> {
    return (await this.restClient.get({ path: paths.premises.show({ premisesId: id }) })) as ApprovedPremises
  }

  async capacity(id: string): Promise<Array<DateCapacity>> {
    return (await this.restClient.get({ path: paths.premises.capacity({ premisesId: id }) })) as Array<DateCapacity>
  }

  async getStaffMembers(premisesId: string): Promise<Array<StaffMember>> {
    return (await this.restClient.get({
      path: paths.premises.staffMembers.index({ premisesId }),
    })) as Array<StaffMember>
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
}
