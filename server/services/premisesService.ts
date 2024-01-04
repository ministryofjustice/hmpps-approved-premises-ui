import type { TableRow } from '@approved-premises/ui'
import type {
  ApprovedPremisesSummary,
  BedDetail,
  BedSummary,
  ExtendedPremisesSummary,
  Premises,
  PremisesSummary,
  Room,
  StaffMember,
} from '@approved-premises/api'
import type { PremisesClient, RestClientBuilder } from '../data'
import paths from '../paths/manage'

import { mapApiOccupancyToUiOccupancy } from '../utils/premisesUtils'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getAll(token: string): Promise<Array<PremisesSummary>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all()

    return premises.sort((a, b) => {
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
  }

  async getStaffMembers(token: string, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(token)

    const staffMembers = await premisesClient.getStaffMembers(premisesId)

    return staffMembers
  }

  async getRooms(token: string, premisesId: string): Promise<Array<Room>> {
    const premisesClient = this.premisesClientFactory(token)

    const rooms = await premisesClient.getRooms(premisesId)

    return rooms
  }

  async getBeds(token: string, premisesId: string): Promise<Array<BedSummary>> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBeds(premisesId)
  }

  async getBed(token: string, premisesId: string, bedId: string): Promise<BedDetail> {
    const premisesClient = this.premisesClientFactory(token)

    return premisesClient.getBed(premisesId, bedId)
  }

  async getRoom(token: string, premisesId: string, roomId: string): Promise<Room> {
    const premisesClient = this.premisesClientFactory(token)

    const room = await premisesClient.getRoom(premisesId, roomId)

    return room
  }

  async tableRows(token: string): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all()

    return premises
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p: ApprovedPremisesSummary) => {
        return [
          this.textValue(p.name),
          this.textValue(p.apCode),
          this.textValue(p.bedCount.toString()),
          this.htmlValue(
            `<a href="${paths.premises.show({ premisesId: p.id })}">View<span class="govuk-visually-hidden">about ${
              p.name
            }</span></a>`,
          ),
        ]
      })
  }

  async find(token: string, id: string): Promise<Premises> {
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

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
