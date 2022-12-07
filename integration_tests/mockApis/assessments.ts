import { SuperAgentRequest } from 'superagent'

import type { Assessment } from '@approved-premises/api'

import { stubFor } from '../../wiremock'

export default {
  stubAssessments: (assessments: Array<Assessment>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/assessments`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessments,
      },
    }),
}
