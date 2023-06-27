import { SuperAgentRequest } from 'superagent'

import type { ApprovedPremisesApplication as Application, Reallocation, Task, User } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'
import { errorStub } from '../../wiremock/utils'
import { kebabCase } from '../../server/utils/utils'

export default {
  stubReallocatableTasks: (tasks: Array<Task>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.tasks.reallocatable.index.pattern,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: tasks,
      },
    }),
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
  stubTaskGet: (args: { application: Application; task: Task; users: Array<User> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.tasks.show({ id: args.application.id, taskType: kebabCase(args.task.taskType) }),
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
          id: args.task.applicationId,
          taskType: kebabCase(args.task.taskType),
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.reallocation,
      },
    }),
  verifyAllocationCreate: async (args: { application: Application; task: Task }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.tasks.allocations.create({
          id: args.application.id,
          taskType: kebabCase(args.task.taskType),
        }),
      })
    ).body.requests,
  stubAllocationErrors: (args: { application: Application; task: Task }) =>
    stubFor(
      errorStub(
        ['userId'],
        paths.tasks.allocations.create({
          id: args.application.id,
          taskType: kebabCase(args.task.taskType),
        }),
      ),
    ),
}
