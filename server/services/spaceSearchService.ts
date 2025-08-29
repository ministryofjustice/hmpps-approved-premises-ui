import type { Cas1NewSpaceBooking, Cas1PlacementRequestDetail, Cas1SpaceBooking } from '@approved-premises/api'
import { SpaceSearchFormData } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import SpaceSearchClient from '../data/spaceSearchClient'

import { spaceSearchStateToApiPayload } from '../utils/match/spaceSearch'

export default class SpaceSearchService {
  constructor(private readonly spaceSearchClientFactory: RestClientBuilder<SpaceSearchClient>) {}

  async search(token: string, searchState: SpaceSearchFormData) {
    const spaceSearchClient = this.spaceSearchClientFactory(token)

    return spaceSearchClient.search(spaceSearchStateToApiPayload(searchState))
  }

  async createSpaceBooking(
    token: string,
    id: Cas1PlacementRequestDetail['id'],
    newSpaceBooking: Cas1NewSpaceBooking,
  ): Promise<Cas1SpaceBooking> {
    const spaceSearchClient = this.spaceSearchClientFactory(token)

    return spaceSearchClient.createSpaceBooking(id, newSpaceBooking)
  }
}
