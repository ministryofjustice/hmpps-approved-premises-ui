import { PlacementApplicationTask, PlacementRequestTask, Reallocation, Task, TaskWrapper } from '@approved-premises/api'
import { GroupedMatchTasks } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import TaskClient from '../data/taskClient'

export default class TaskService {
  constructor(private readonly taskClientFactory: RestClientBuilder<TaskClient>) {}

  async getAllReallocatable(token: string): Promise<Array<Task>> {
    const taskClient = this.taskClientFactory(token)

    const tasks = await taskClient.allReallocatable()
    return tasks
  }

  async getMatchTasks(token: string): Promise<GroupedMatchTasks> {
    const taskClient = this.taskClientFactory(token)

    const tasks = await taskClient.allForUser()
    const results = {
      notMatched: [],
      unableToMatch: [],
      matched: [],
      placementApplications: [],
    } as GroupedMatchTasks

    tasks.forEach(task => {
      switch (task.taskType) {
        case 'PlacementApplication': {
          results.placementApplications.push(task as PlacementApplicationTask)
          break
        }
        case 'PlacementRequest': {
          const t = task as PlacementRequestTask
          results[t.placementRequestStatus].push(t)
          break
        }
        default:
          break
      }
    })

    return results
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
