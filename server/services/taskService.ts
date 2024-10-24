import {
  Cas1CruManagementArea,
  PlacementApplicationTask,
  PlacementRequestTask,
  Reallocation,
  SortDirection,
  Task,
  TaskSortField,
  TaskType,
  TaskWrapper,
  ApprovedPremisesUser as User,
  UserQualification,
} from '@approved-premises/api'
import { GroupedMatchTasks, PaginatedResponse, TaskSearchQualification } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import TaskClient from '../data/taskClient'

export default class TaskService {
  constructor(private readonly taskClientFactory: RestClientBuilder<TaskClient>) {}

  async getAll({
    token,
    allocatedFilter,
    allocatedToUserId = '',
    sortBy,
    sortDirection,
    page = 1,
    cruManagementAreaId = '',
    taskTypes,
    requiredQualification,
    crnOrName,
    isCompleted = false,
  }: {
    token: string
    allocatedFilter: 'allocated' | 'unallocated'
    allocatedToUserId?: string
    sortBy: TaskSortField
    sortDirection: SortDirection
    page: number
    cruManagementAreaId?: string
    taskTypes?: Array<TaskType>
    requiredQualification?: TaskSearchQualification
    crnOrName?: string
    isCompleted?: boolean
  }): Promise<PaginatedResponse<Task>> {
    const taskClient = this.taskClientFactory(token)

    return taskClient.getAll({
      allocatedFilter,
      allocatedToUserId,
      cruManagementAreaId,
      page,
      sortDirection,
      sortBy,
      taskTypes,
      requiredQualification,
      crnOrName,
      isCompleted,
    })
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

  async find(
    token: string,
    premisesId: string,
    taskType: string,
    userFilters: { cruManagementAreaId?: Cas1CruManagementArea['id']; qualification?: UserQualification },
  ): Promise<TaskWrapper> {
    const taskClient = this.taskClientFactory(token)

    const task = await taskClient.find(premisesId, taskType)

    const { cruManagementAreaId, qualification } = userFilters

    if (cruManagementAreaId || qualification) {
      task.users = task.users.filter(user => {
        const includesCruManagementAreaIdIfFilter = cruManagementAreaId
          ? user.cruManagementArea.id === cruManagementAreaId
          : true
        const includesQualificationIfFilter = qualification ? user.qualifications.includes(qualification) : true
        return includesCruManagementAreaIdIfFilter && includesQualificationIfFilter
      })
    }

    return task
  }

  async createAllocation(
    token: string,
    applicationId: string,
    userId: User['id'],
    taskType: Task['taskType'],
  ): Promise<Reallocation> {
    const taskClient = this.taskClientFactory(token)

    const allocation = await taskClient.createAllocation(applicationId, userId, taskType)

    return allocation
  }
}
