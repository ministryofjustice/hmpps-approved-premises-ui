import type {
  Cas1NewSpaceBooking as NewSpaceBooking,
  PlacementRequest,
  Cas1SpaceBooking as SpaceBooking,
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResults as SpaceSearchResults,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'

export default class SpaceSearchClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('spaceSearchClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(params: SpaceSearchParameters): Promise<SpaceSearchResults> {
    return (await this.restClient.post({
      path: paths.match.findSpaces.pattern,
      data: { ...params },
    })) as Promise<SpaceSearchResults>
  }

  async createSpaceBooking(placementRequestId: PlacementRequest['id'], data: NewSpaceBooking): Promise<SpaceBooking> {
    return (await this.restClient.post({
      path: paths.placementRequests.spaceBookings.create({ placementRequestId }),
      data,
    })) as SpaceBooking
  }
}
