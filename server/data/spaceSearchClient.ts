import type {
  Cas1PlacementRequestDetail,
  Cas1NewSpaceBooking as NewSpaceBooking,
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
    return this.restClient.post<SpaceSearchResults>({
      path: paths.match.findSpaces.pattern,
      data: { ...params },
    })
  }

  async createSpaceBooking(
    placementRequestId: Cas1PlacementRequestDetail['id'],
    data: NewSpaceBooking,
  ): Promise<SpaceBooking> {
    return this.restClient.post<SpaceBooking>({
      path: paths.placementRequests.spaceBookings.create({ placementRequestId }),
      data,
    })
  }
}
