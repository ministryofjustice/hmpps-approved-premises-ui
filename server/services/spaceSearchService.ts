import type {
  Cas1NewSpaceBooking,
  Cas1SpaceBooking,
  PlacementRequest,
  PlacementRequestDetail,
} from '@approved-premises/api'
import type { Request } from 'express'
import { RestClientBuilder } from '../data'
import SpaceSearchClient from '../data/spaceSearchClient'

import { SpaceSearchState, spaceSearchStateToApiPayload } from '../utils/match/spaceSearch'

export default class SpaceSearchService {
  constructor(private readonly spaceSearchClientFactory: RestClientBuilder<SpaceSearchClient>) {}

  async search(token: string, searchState: SpaceSearchState) {
    const spaceSearchClient = this.spaceSearchClientFactory(token)

    return spaceSearchClient.search(spaceSearchStateToApiPayload(searchState))
  }

  async createSpaceBooking(
    token: string,
    id: PlacementRequest['id'],
    newSpaceBooking: Cas1NewSpaceBooking,
  ): Promise<Cas1SpaceBooking> {
    const spaceSearchClient = this.spaceSearchClientFactory(token)

    return spaceSearchClient.createSpaceBooking(id, newSpaceBooking)
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
