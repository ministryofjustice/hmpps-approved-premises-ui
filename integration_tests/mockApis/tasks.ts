import { SuperAgentRequest } from 'superagent'

import type { ApprovedPremisesApplication as Application, Reallocation, Task } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'
import { errorStub } from '../../wiremock/utils'

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

  stubTaskAllocationCreate: (args: { task: Task; reallocation: Reallocation }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.applications.allocation.create({ id: args.task.applicationId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.task,
      },
    }),
  verifyAllocationCreate: async (application: Application) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.applications.allocation.create({ id: application.id }),
      })
    ).body.requests,
  stubAllocationErrors: (application: Application) =>
    stubFor(errorStub(['userId'], paths.applications.allocation.create({ id: application.id }))),
}
