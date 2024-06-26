import { SuperAgentRequest } from 'superagent'

import type {
  Appeal,
  ApplicationSortField,
  ApplicationTimelineNote,
  ApprovedPremisesApplication,
  ApprovedPremisesApplicationSummary,
  ApprovedPremisesAssessment,
  PlacementApplication,
  RequestForPlacement,
  SortDirection,
  TimelineEvent,
} from '@approved-premises/api'
import { Withdrawables } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'
import { ApplicationDashboardSearchOptions } from '../../server/@types/ui'
import { errorStub } from './utils'

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
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchOptions = {},
  }: {
    applications: Array<ApprovedPremisesApplicationSummary>
    page: string
    sortBy: ApplicationSortField
    sortDirection: SortDirection
    searchOptions: Partial<ApplicationDashboardSearchOptions>
  }): SuperAgentRequest => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
      sortBy: {
        equalTo: sortBy,
      },
      sortDirection: {
        equalTo: sortDirection,
      },
    }

    Object.keys(searchOptions).forEach(key => {
      if (searchOptions[key]) {
        queryParameters[key] = {
          equalTo: searchOptions[key],
        }
      }
    })

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
  verifyDashboardRequest: async ({
    page = '1',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchOptions = {},
  }: {
    page: string
    sortBy: ApplicationSortField
    sortDirection: SortDirection
    searchOptions: Partial<ApplicationDashboardSearchOptions>
  }) => {
    const queryParameters = {
      page: {
        equalTo: page,
      },
      sortBy: {
        equalTo: sortBy,
      },
      sortDirection: {
        equalTo: sortDirection,
      },
    }
    Object.keys(searchOptions).forEach(key => {
      if (searchOptions[key]) {
        queryParameters[key] = {
          equalTo: searchOptions[key],
        }
      }
    })

    const request = await getMatchingRequests({
      method: 'GET',
      urlPathPattern: paths.applications.all.pattern,
      queryParameters,
    })

    return request.body.requests
  },
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
    placementApplications: Array<PlacementApplication>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.applications.placementApplications({ id: args.applicationId })}?includeInitialRequestForPlacement=true`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.placementApplications,
      },
    }),
  stubApplicationRequestsForPlacement: ({
    requestsForPlacement,
    applicationId,
  }: {
    requestsForPlacement: Array<RequestForPlacement>
    applicationId: ApprovedPremisesApplication['id']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.applications.requestsForPlacement({ id: applicationId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: requestsForPlacement,
      },
    }),

  stubApplicationNote: (args: {
    applicationId: ApprovedPremisesApplication['id']
    note: ApplicationTimelineNote
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.applications.addNote({ id: args.applicationId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.note,
      },
    }),

  stubWithdrawablesWithNotes: ({
    applicationId,
    withdrawables,
  }: {
    applicationId: string
    withdrawables: Withdrawables
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.withdrawablesWithNotes({ id: applicationId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: withdrawables,
      },
    }),
  stubAppeals: ({ applicationId, appeal }: { applicationId: string; appeal: Appeal }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.appeals.show({ id: applicationId, appealId: appeal.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appeal,
      },
    }),
  stubAppealCreate: ({ applicationId, appeal }: { applicationId: string; appeal: Appeal }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.applications.appeals.create({ id: applicationId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: appeal,
      },
    }),
  stubAppealErrors: ({ applicationId, params }: { applicationId: string; params: Array<string> }) =>
    stubFor(errorStub(params, paths.applications.appeals.create({ id: applicationId }))),
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
  verifyApplicationNoteAdded: async (args: { id: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.applications.addNote({ id: args.id }),
      })
    ).body.requests,
  verifyAppealCreated: async (args: { applicationId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.applications.appeals.create({ id: args.applicationId }),
      })
    ).body.requests,
}
