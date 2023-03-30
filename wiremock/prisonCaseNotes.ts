import { guidRegex } from '.'
import { prisonCaseNotesFactory } from '../server/testutils/factories'

export default [
  {
    priority: 99,
    request: {
      method: 'GET',
      urlPathPattern: `/people/${guidRegex}/prison-case-notes`,
      queryParameters: {
        crn: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prisonCaseNotesFactory.buildList(Math.floor(Math.random() * 5)),
    },
  },
]
