import paths from '../server/paths/api'
import { taskFactory } from '../server/testutils/factories'

export default [
  {
    priority: 99,
    request: {
      method: 'GET',
      urlPathPattern: paths.tasks.index.pattern,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: taskFactory.buildList(5),
    },
  },
]
