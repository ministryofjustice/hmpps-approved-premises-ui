import {
  PlacementApplicationTask,
  PlacementRequestTask,
  Reallocation,
  SortDirection,
  Task,
  TaskSortField,
  TaskWrapper,
  ApprovedPremisesUser as User,
  UserQualification,
} from '@approved-premises/api'
import { GroupedMatchTasks, PaginatedResponse } from '@approved-premises/ui'
import { RestClientBuilder } from '../data'
import TaskClient from '../data/taskClient'

export default class TaskService {
  constructor(private readonly taskClientFactory: RestClientBuilder<TaskClient>) {}

  async getAllReallocatable(
    token: string,
    allocatedFilter: 'allocated' | 'unallocated',
    sortBy: TaskSortField,
    sortDirection: SortDirection,
    page: number = 1,
    apAreaId: string = '',
  ): Promise<PaginatedResponse<Task>> {
    const taskClient = this.taskClientFactory(token)

    const tasks = await taskClient.allReallocatable(allocatedFilter, apAreaId, page, sortDirection, sortBy)
    return tasks
  }

  async getTasksOfType(token: string, type: string, page: number = 1): Promise<PaginatedResponse<Task>> {
    const taskClient = this.taskClientFactory(token)

    return taskClient.allByType(type, page)
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
    userFilters: { apAreaId?: string; qualification?: UserQualification },
  ): Promise<TaskWrapper> {
    const taskClient = this.taskClientFactory(token)

    const task = await taskClient.find(premisesId, taskType)

    const { apAreaId, qualification } = userFilters

    if (apAreaId || qualification) {
      task.users = task.users.filter(user => {
        const includesApAreaIdIfFilter = apAreaId ? user.apArea.id === apAreaId : true
        const includesQualificationIfFilter = qualification ? user.qualifications.includes(qualification) : true
        return includesApAreaIdIfFilter && includesQualificationIfFilter
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
