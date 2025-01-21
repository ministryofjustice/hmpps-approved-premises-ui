import type {
  Cas1NewSpaceBooking,
  Cas1SpaceBooking,
  PlacementRequest,
  PlacementRequestDetail,
} from '@approved-premises/api'
import type { SpaceSearchParametersUi, SpaceSearchState } from '@approved-premises/ui'
import type { Request } from 'express'
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

  getSpaceSearchState(placementRequestId: PlacementRequestDetail['id'], session: Request['session']): SpaceSearchState {
    return session.spaceSearch?.[placementRequestId]
  }

  setSpaceSearchState(
    placementRequestId: PlacementRequestDetail['id'],
    session: Request['session'],
    data: Partial<SpaceSearchState>,
  ): void {
    session.spaceSearch = session.spaceSearch || {}

    session.spaceSearch[placementRequestId] = {
      ...this.getSpaceSearchState(placementRequestId, session),
      ...data,
    }
  }

  removeSpaceSearchState(placementRequestId: PlacementRequestDetail['id'], session: Request['session']): void {
    delete session.spaceSearch?.[placementRequestId]
  }
}
