import { SuperAgentRequest } from 'superagent'

import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

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
  stubAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/assessments/${assessment.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessment,
      },
    }),
  stubAssessmentUpdate: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/assessments/${args.assessment.id}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessment,
      },
    }),
}
