import type { Task } from '@approved-premises/api'

import { stubFor } from '../../wiremock'

import paths from '../../server/paths/api'

const stubTasks = (tasks: Array<Task>) =>
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
  })

export default { stubTasks }
