import paths from '../server/paths/api'
import userFactory from '../server/testutils/factories/user'

export default [
  {
    priority: 99,
    request: {
      method: 'GET',
      urlPathPattern: paths.users.profile.pattern,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: userFactory.build(),
    },
  },
]
