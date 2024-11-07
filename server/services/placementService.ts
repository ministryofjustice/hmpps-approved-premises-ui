import { Cas1NewArrival } from '@approved-premises/api'
import type { RestClientBuilder } from '../data'
import PlacementClient from '../data/placementClient'

export default class PlacementService {
  constructor(private readonly placementClientFactory: RestClientBuilder<PlacementClient>) {}

  async createArrival(token: string, premisesId: string, placementId: string, newPlacementArrival: Cas1NewArrival) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.createArrival(premisesId, placementId, newPlacementArrival)
  }
}
