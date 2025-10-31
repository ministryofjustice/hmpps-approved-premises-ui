import { SuperAgentRequest } from 'superagent'

import type {
  ApprovedPremisesAssessment as Assessment,
  Cas1AssessmentStatus,
  Cas1AssessmentSummary as AssessmentSummary,
  Cas1NewClarificationNote,
  SortDirection,
  Cas1UpdatedClarificationNote,
} from '@approved-premises/api'

import { AssessmentSortField } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubAssessments: ({
    assessments,
    statuses,
    sortBy = 'name',
    sortDirection = 'asc',
    page = '1',
  }: {
    assessments: Array<AssessmentSummary>
    statuses: Array<Cas1AssessmentStatus>
    sortDirection: SortDirection
    sortBy: AssessmentSortField
    page: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.assessments.index.pattern,
        queryParameters: {
          page: {
            equalTo: page,
          },
          statuses: {
            equalTo: statuses.join(','),
          },
          sortBy: {
            equalTo: sortBy,
          },
          sortDirection: {
            equalTo: sortDirection,
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-TotalPages': '10',
          'X-Pagination-TotalResults': '100',
          'X-Pagination-PageSize': '10',
        },
        jsonBody: assessments,
      },
    }),
  stubAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.assessments.show({ id: assessment.id }),
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
        url: paths.assessments.update({ id: assessment.id }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessment,
      },
    }),
  stubAssessmentRejection: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.assessments.rejection({ id: assessment.id }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
  stubAssessmentAcceptance: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.assessments.acceptance({ id: assessment.id }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
  stubClarificationNoteCreate: (args: { assessment: Assessment; note: Cas1NewClarificationNote }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.assessments.clarificationNotes.create({
          id: args.assessment.id,
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.note,
      },
    }),
  stubClarificationNoteUpdate: (args: {
    assessment: Assessment
    clarificationNoteId: string
    note: Cas1UpdatedClarificationNote
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: paths.assessments.clarificationNotes.update({
          id: args.assessment.id,
          clarificationNoteId: args.clarificationNoteId,
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.note,
      },
    }),
  verifyClarificationNoteCreate: async (assessment: Assessment) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.assessments.clarificationNotes.create({ id: assessment.id }),
      })
    ).body.requests,
  verifyClarificationNoteUpdate: async (assessment: Assessment) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.assessments.clarificationNotes.update({
          id: assessment.id,
          clarificationNoteId: assessment.clarificationNotes[0].id,
        }),
      })
    ).body.requests,
  verifyAssessmentAcceptance: async (assessment: Assessment) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.assessments.acceptance({
          id: assessment.id,
        }),
      })
    ).body.requests,
  verifyAssessmentRejection: async (assessment: Assessment) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.assessments.rejection({
          id: assessment.id,
        }),
      })
    ).body.requests,
  verifyAssessmentUpdate: async (assessment: Assessment) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: paths.assessments.show({ id: assessment.id }),
      })
    ).body.requests,
  verifyAssessmentsRequests: async ({
    page = '1',
    statuses,
    sortBy = 'name',
    sortDirection = 'asc',
  }: {
    page: string
    statuses: Array<Cas1AssessmentStatus>
    sortDirection: SortDirection
    sortBy: AssessmentSortField
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPathPattern: paths.assessments.index.pattern,
        queryParameters: {
          page: {
            equalTo: page,
          },
          statuses: {
            equalTo: statuses.join(','),
          },
          sortBy: {
            equalTo: sortBy,
          },
          sortDirection: {
            equalTo: sortDirection,
          },
        },
      })
    ).body.requests,
}
