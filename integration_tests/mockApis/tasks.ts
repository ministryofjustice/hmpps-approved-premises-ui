import { SuperAgentRequest } from 'superagent'

import type { ApprovedPremisesApplication as Application, Reallocation, Task } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'
import { errorStub } from '../../wiremock/utils'
import { kebabCase } from '../../server/utils/utils'

export default {
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
  stubTaskGet: (args: { application: Application; task: Task }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.applications.tasks.show({ id: args.application.id, taskType: kebabCase(args.task.taskType) }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.task,
      },
    }),
  stubTaskAllocationCreate: (args: { task: Task; reallocation: Reallocation }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.applications.tasks.allocations.create({
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
        url: paths.applications.tasks.allocations.create({
          id: args.application.id,
          taskType: kebabCase(args.task.taskType),
        }),
      })
    ).body.requests,
  stubAllocationErrors: (args: { application: Application; task: Task }) =>
    stubFor(
      errorStub(
        ['userId'],
        paths.applications.tasks.allocations.create({
          id: args.application.id,
          taskType: kebabCase(args.task.taskType),
        }),
      ),
    ),
}
