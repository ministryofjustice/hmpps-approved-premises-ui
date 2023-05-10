import type { ApprovedPremises, DateCapacity, Room, StaffMember } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<ApprovedPremises>> {
    return (await this.restClient.get({ path: paths.premises.index({}) })) as Array<ApprovedPremises>
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

  async getRooms(premisesId: string): Promise<Array<Room>> {
    return (await this.restClient.get({ path: paths.premises.rooms({ premisesId }) })) as Array<Room>
  }

  async getRoom(premisesId: string, roomId: string): Promise<Room> {
    return (await this.restClient.get({ path: paths.premises.room({ premisesId, roomId }) })) as Room
  }
}
