import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { Reallocation, Task } from '../@types/shared'

export default class TaskClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('taskClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<Task>> {
    return (await this.restClient.get({ path: paths.tasks.index.pattern })) as Promise<Array<Task>>
  }

  async createAllocation(applicationId: string, userId: string, taskType: string): Promise<Reallocation> {
    return (await this.restClient.post({
      path: paths.applications.tasks.allocations.create({ id: applicationId, taskType }),
      data: { userId },
    })) as Reallocation
  }
}
