import { RestClientBuilder } from '../data'
import TaskClient from '../data/taskClient'

export default class TaskService {
  constructor(private readonly taskClientFactory: RestClientBuilder<TaskClient>) {}

  async getAll(token: string) {
    const taskClient = this.taskClientFactory(token)

    const tasks = await taskClient.all()
    return tasks
  }
}
