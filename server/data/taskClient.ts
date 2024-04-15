import { CategorisedTask, PaginatedResponse, TaskSearchQualification } from '@approved-premises/ui'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import {
  AllocatedFilter,
  ApArea,
  Reallocation,
  Task,
  TaskSortField,
  TaskType,
  TaskWrapper,
  User,
} from '../@types/shared'

export default class TaskClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('taskClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getAll({
    allocatedFilter,
    apAreaId,
    allocatedToUserId,
    page,
    sortDirection,
    sortBy,
    taskTypes,
    requiredQualification,
    crnOrName,
    isCompleted = false,
  }: {
    allocatedFilter: AllocatedFilter
    apAreaId: ApArea['id']
    allocatedToUserId: string
    page: number
    sortDirection: string
    sortBy: TaskSortField
    taskTypes?: Array<TaskType>
    requiredQualification?: TaskSearchQualification
    crnOrName?: string
    isCompleted?: boolean
  }): Promise<PaginatedResponse<Task>> {
    const filters = {} as Record<string, string>
    if (taskTypes.length) {
      filters.types = taskTypes.join(',')
    }
    return this.restClient.getPaginatedResponse({
      path: paths.tasks.index.pattern,
      page: page.toString(),
      query: {
        ...filters,
        allocatedFilter,
        allocatedToUserId,
        apAreaId,
        sortBy,
        sortDirection,
        requiredQualification,
        crnOrName,
        isCompleted: isCompleted.toString(),
      },
    })
  }

  async allForUser(): Promise<Array<CategorisedTask>> {
    return (await this.restClient.get({ path: paths.tasks.index.pattern })) as Promise<Array<CategorisedTask>>
  }

  async find(applicationId: string, taskType: string): Promise<TaskWrapper> {
    return (await this.restClient.get({
      path: paths.tasks.show({ id: applicationId, taskType }),
    })) as Promise<TaskWrapper>
  }

  async createAllocation(applicationId: string, userId: User['id'], taskType: Task['taskType']): Promise<Reallocation> {
    return (await this.restClient.post({
      path: paths.tasks.allocations.create({ id: applicationId, taskType }),
      data: { userId },
    })) as Reallocation
  }
}
