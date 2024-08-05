import {
  NewCas1SpaceBooking as NewSpaceBooking,
  PlacementRequest,
  Cas1SpaceBooking as SpaceBooking,
} from '@approved-premises/api'
import { SpaceSearchParametersUi } from '../@types/ui'
import { RestClientBuilder } from '../data'
import SpaceClient from '../data/spaceClient'
import { mapUiParamsForApi } from '../utils/match'

export default class SpaceService {
  constructor(private readonly spaceClientFactory: RestClientBuilder<SpaceClient>) {}

  async search(token: string, params: SpaceSearchParametersUi) {
    const spaceClient = this.spaceClientFactory(token)

    const spaces = await spaceClient.search(mapUiParamsForApi(params))
    return spaces
  }

  async createSpaceBooking(
    token: string,
    id: PlacementRequest['id'],
    newSpaceBooking: NewSpaceBooking,
  ): Promise<SpaceBooking> {
    const spaceClient = this.spaceClientFactory(token)

    return spaceClient.createSpaceBooking(id, newSpaceBooking)
  }
}
