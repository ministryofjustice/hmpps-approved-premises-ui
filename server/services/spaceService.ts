import type { Cas1NewSpaceBooking, Cas1SpaceBooking, PlacementRequest } from '@approved-premises/api'
import type { SpaceSearchParametersUi } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import SpaceClient from '../data/spaceClient'
import { mapUiParamsForApi } from '../utils/match'

export default class SpaceService {
  constructor(private readonly spaceClientFactory: RestClientBuilder<SpaceClient>) {}

  async search(token: string, params: SpaceSearchParametersUi) {
    const spaceClient = this.spaceClientFactory(token)

    return spaceClient.search(mapUiParamsForApi(params))
  }

  async createSpaceBooking(
    token: string,
    id: PlacementRequest['id'],
    newSpaceBooking: Cas1NewSpaceBooking,
  ): Promise<Cas1SpaceBooking> {
    const spaceClient = this.spaceClientFactory(token)

    return spaceClient.createSpaceBooking(id, newSpaceBooking)
  }
}
