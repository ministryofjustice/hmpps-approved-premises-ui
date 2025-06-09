import { SuperAgentRequest } from 'superagent'

import type {
  Appeal,
  ApplicationSortField,
  ApplicationTimelineNote,
  ApprovedPremisesApplication,
  Cas1ApplicationSummary,
  Cas1TimelineEvent,
  RequestForPlacement,
  SortDirection,
} from '@approved-premises/api'
import { Withdrawables } from '@approved-premises/api'
import { ApplicationDashboardSearchOptions } from '@approved-premises/ui'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'
import { errorStub } from './utils'

export default {
  stubApplications: (applications: Array<Cas1ApplicationSummary>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.index({}),
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
    applications: Array<Cas1ApplicationSummary>
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
  stubApplicationGet: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.show({ id: args.application.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  stubApplicationDocuments: (args: {
    application: ApprovedPremisesApplication
    documents: Array<Document>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.applications.documents({ id: args.application.id }),
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
        url: paths.applications.submission({ id: args.application.id }),
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
  stubApplicationTimeline: (args: { applicationId: string; timeline: Array<Cas1TimelineEvent> }): SuperAgentRequest =>
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
        url: `${paths.applications.new({})}?createWithRisks=true`,
      })
    ).body.requests,
  verifyApplicationUpdate: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.applications.update({ id: applicationId }),
      })
    ).body.requests,
  verifyApplicationSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.applications.submission({ id: applicationId }),
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
