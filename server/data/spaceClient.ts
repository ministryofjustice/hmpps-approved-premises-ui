import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import {
  NewCas1SpaceBooking as NewSpaceBooking,
  PlacementRequest,
  Cas1SpaceBooking as SpaceBooking,
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResults as SpaceSearchResults,
} from '../@types/shared'

export default class SpaceClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('spaceClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(params: SpaceSearchParameters): Promise<SpaceSearchResults> {
    return (await this.restClient.post({
      path: paths.match.findSpaces.pattern,
      data: { ...params },
    })) as Promise<SpaceSearchResults>
  }

  async createSpaceBooking(placementRequestId: PlacementRequest['id'], data: NewSpaceBooking): Promise<SpaceBooking> {
    return (await this.restClient.post({
      path: paths.placementRequests.spaceBookings.create({ id: placementRequestId }),
      data,
    })) as SpaceBooking
  }
}
