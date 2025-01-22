import type {
  Cas1NewSpaceBooking,
  Cas1SpaceBooking,
  PlacementRequest,
  PlacementRequestDetail,
} from '@approved-premises/api'
import type { Request } from 'express'
import { RestClientBuilder } from '../data'
import SpaceClient from '../data/spaceClient'

import { SpaceSearchState, spaceSearchStateToApiPayload } from '../utils/match/spaceSearch'

export default class SpaceService {
  constructor(private readonly spaceClientFactory: RestClientBuilder<SpaceClient>) {}

  async search(token: string, searchState: SpaceSearchState) {
    const spaceClient = this.spaceClientFactory(token)

    return spaceClient.search(spaceSearchStateToApiPayload(searchState))
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
  ): SpaceSearchState {
    session.spaceSearch = session.spaceSearch || {}

    session.spaceSearch[placementRequestId] = {
      ...this.getSpaceSearchState(placementRequestId, session),
      ...data,
    }

    return session.spaceSearch[placementRequestId]
  }

  removeSpaceSearchState(placementRequestId: PlacementRequestDetail['id'], session: Request['session']): void {
    delete session.spaceSearch?.[placementRequestId]
  }
}
