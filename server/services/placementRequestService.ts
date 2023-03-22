import { RestClientBuilder } from '../data'
import PlacementRequestClient from '../data/placementRequestClient'

export default class TaskService {
  constructor(private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>) {}

  async getAll(token: string) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    const tasks = await placementRequestClient.all()
    return tasks
  }
}
