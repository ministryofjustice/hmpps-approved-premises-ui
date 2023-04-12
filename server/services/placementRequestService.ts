import { GroupedPlacementRequests } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import PlacementRequestClient from '../data/placementRequestClient'

export default class TaskService {
  constructor(private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>) {}

  async getAll(token: string) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    const results = {
      notMatched: [],
      unableToMatch: [],
      matched: [],
    } as GroupedPlacementRequests

    const placementRequests = await placementRequestClient.all()

    placementRequests.forEach(placementRequest => {
      results[placementRequest.status].push(placementRequest)
    })

    return results
  }
}
