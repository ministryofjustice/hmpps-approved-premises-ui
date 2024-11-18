import { Cas1AssignKeyWorker, Cas1NewArrival, Cas1NonArrival, NonArrivalReason } from '@approved-premises/api'
import type { ReferenceDataClient, RestClientBuilder } from '../data'
import PlacementClient from '../data/placementClient'

export default class PlacementService {
  constructor(
    private readonly placementClientFactory: RestClientBuilder<PlacementClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createArrival(token: string, premisesId: string, placementId: string, newPlacementArrival: Cas1NewArrival) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.createArrival(premisesId, placementId, newPlacementArrival)
  }

  async assignKeyworker(
    token: string,
    premisesId: string,
    placementId: string,
    keyworkerAssignment: Cas1AssignKeyWorker,
  ) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.assignKeyworker(premisesId, placementId, keyworkerAssignment)
  }

  async getNonArrivalReasons(token: string): Promise<Array<NonArrivalReason>> {
    const client = this.referenceDataClientFactory(token)
    const allNonArrivalReasons = await client.getNonArrivalReasons()

    return allNonArrivalReasons.filter(({ isActive }) => isActive)
  }

  async recordNonArrival(token: string, premisesId: string, placementId: string, nonArrival: Cas1NonArrival) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.recordNonArrival(premisesId, placementId, nonArrival)
  }
}
