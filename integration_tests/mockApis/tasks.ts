import { SuperAgentRequest } from 'superagent'

import type { Reallocation, SortDirection, Task, TaskSortField, User } from '@approved-premises/api'
import { AllocatedFilter } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'
import { errorStub } from './utils'
import { kebabCase } from '../../server/utils/utils'

export default {
  stubReallocatableTasks: ({
    tasks,
    allocatedFilter = 'allocated',
    page = '1',
    sortDirection = 'asc',
    sortBy = 'createdAt',
    apAreaId = '',
  }: {
    tasks: Array<Task>
    page: string
    allocatedFilter: string
    sortDirection: SortDirection
    sortBy: TaskSortField
    apAreaId: string
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
      allocatedFilter: {
        equalTo: allocatedFilter,
      },
      apAreaId: {
        equalTo: apAreaId,
      },
      sortDirection: {
        equalTo: sortDirection,
      },
      sortBy: {
        equalTo: sortBy,
      },
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.tasks.reallocatable.index.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: tasks,
      },
    })
  },
  stubTasks: (tasks: Array<Task>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.tasks.index.pattern,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: tasks,
      },
    }),
  stubTasksOfType: (args: { tasks: Array<Task>; type: string; page: string }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.tasks.type.index({ taskType: args.type }),
        queryParameters: {
          page: {
            equalTo: args.page || '1',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: args.tasks,
      },
    }),
  stubTaskGet: (args: { task: Task; users: Array<User> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.tasks.show({ id: args.task.id, taskType: kebabCase(args.task.taskType) }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { task: args.task, users: args.users },
      },
    }),
  stubTaskAllocationCreate: (args: { task: Task; reallocation: Reallocation }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.tasks.allocations.create({
          id: args.task.id,
          taskType: kebabCase(args.task.taskType),
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.reallocation,
      },
    }),
  verifyAllocationCreate: async (task: Task) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.tasks.allocations.create({
          id: task.id,
          taskType: kebabCase(task.taskType),
        }),
      })
    ).body.requests,
  stubAllocationErrors: (task: Task) =>
    stubFor(
      errorStub(
        ['userId'],
        paths.tasks.allocations.create({
          id: task.id,
          taskType: kebabCase(task.taskType),
        }),
      ),
    ),
  verifyTasksRequests: async ({
    allocatedFilter,
    page = '1',
    sortDirection = 'asc',
    sortBy = 'createdAt',
  }: {
    allocatedFilter: AllocatedFilter
    page: string
    sortDirection: SortDirection
    sortBy: TaskSortField
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.tasks.reallocatable.index.pattern,
        queryParameters: {
          allocatedFilter: {
            equalTo: allocatedFilter,
          },
          page: {
            equalTo: page,
          },
          sortDirection: {
            equalTo: sortDirection,
          },
          sortBy: {
            equalTo: sortBy,
          },
        },
      })
    ).body.requests,
}
