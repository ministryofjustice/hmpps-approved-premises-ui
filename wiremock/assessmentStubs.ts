import { guidRegex } from './index'

import { assessmentFactory } from '../server/testutils/factories'

export default [
  {
    request: {
      method: 'GET',
      url: `/assessments`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: assessmentFactory.buildList(20),
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: `/assessments/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: assessmentFactory.build(),
    },
  },
]
