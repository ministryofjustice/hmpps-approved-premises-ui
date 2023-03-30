import { Reallocation, Task, TaskWrapper } from '@approved-premises/api'
import { RestClientBuilder } from '../data'
import TaskClient from '../data/taskClient'

export default class TaskService {
  constructor(private readonly taskClientFactory: RestClientBuilder<TaskClient>) {}

  async getAll(token: string): Promise<Array<Task>> {
    const taskClient = this.taskClientFactory(token)

    const tasks = await taskClient.all()
    return tasks
  }

  async find(token: string, premisesId: string, taskType: string): Promise<TaskWrapper> {
    const taskClient = this.taskClientFactory(token)

    const task = await taskClient.find(premisesId, taskType)

    return task
  }

  async createAllocation(
    token: string,
    applicationId: string,
    userId: string,
    taskType: string,
  ): Promise<Reallocation> {
    const taskClient = this.taskClientFactory(token)

    const allocation = await taskClient.createAllocation(applicationId, userId, taskType)

    return allocation
  }
}
