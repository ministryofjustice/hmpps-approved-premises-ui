import { SuperAgentRequest } from 'superagent'

import type {
  ApprovedPremisesApplication,
  ApprovedPremisesApplicationSummary,
  ApprovedPremisesAssessment,
  TimelineEvent,
} from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'

export default {
  stubApplications: (applications: Array<ApprovedPremisesApplicationSummary>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: applications,
      },
    }),
  stubAllApplications: ({
    applications,
    page = '1',
  }: {
    applications: Array<ApprovedPremisesApplicationSummary>
    page: string
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
    } as Record<string, unknown>

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.applications.all.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: applications,
      },
    })
  },
  verifyDashboardRequest: async ({ page = '1' }: { page: string }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.applications.all.pattern,
        queryParameters: {
          page: {
            equalTo: page,
          },
        },
      })
    ).body.requests,
  stubApplicationCreate: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/applications?createWithRisks=true`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...args.application, data: null, type: 'CAS1' },
      },
    }),
  stubApplicationUpdate: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/applications/${args.application.id}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: `
        {
          "id": "{{request.pathSegments.[1]}}",
          "person": ${JSON.stringify(args.application.person)},
          "createdByProbationOfficerId": "${args.application.createdByUserId}",
          "schemaVersion": "${args.application.schemaVersion}",
          "createdAt": "${args.application.createdAt}",
          "submittedAt": "${args.application.submittedAt}",
          "data": {{{jsonPath request.body '$.data'}}}
        }
        `,
        transformers: ['response-template'],
      },
    }),
  stubApplicationGet: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications/${args.application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  stubApplicationAssessment: (args: {
    application: ApprovedPremisesApplication
    assessment: ApprovedPremisesAssessment
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications/${args.application.id}/assessment`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.assessment,
      },
    }),
  stubApplicationDocuments: (args: {
    application: ApprovedPremisesApplication
    documents: Array<Document>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications/${args.application.id}/documents`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.documents,
      },
    }),
  stubApplicationSubmit: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/applications/${args.application.id}/submission`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
  stubApplicationWithdrawn: (args: { applicationId: string }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.applications.withdrawal({ id: args.applicationId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
  stubApplicationTimeline: (args: { applicationId: string; timeline: Array<TimelineEvent> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.timeline({ id: args.applicationId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.timeline,
      },
    }),
  stubApplicationPlacementRequests: (args: {
    applicationId: string
    placementApplications: Array<TimelineEvent>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.placementApplications({ id: args.applicationId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.placementApplications,
      },
    }),

  verifyApplicationWithdrawn: async (args: { applicationId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.applications.withdrawal({ id: args.applicationId }),
      })
    ).body.requests,
  verifyApplicationCreate: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/applications?createWithRisks=true`,
      })
    ).body.requests,
  verifyApplicationUpdate: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: `/applications/${applicationId}`,
      })
    ).body.requests,
  verifyApplicationSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/applications/${applicationId}/submission`,
      })
    ).body.requests,
}
