import { SuperAgentRequest } from 'superagent'

import type {
  ApprovedPremisesAssessment as Assessment,
  NewClarificationNote,
  UpdatedClarificationNote,
} from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'
import paths from '../../server/paths/api'

export default {
  stubAssessments: (assessments: Array<Assessment>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.assessments.index({}),
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
        url: paths.assessments.show({ id: assessment.id }),
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
  stubClarificationNoteCreate: (args: { assessment: Assessment; note: NewClarificationNote }): SuperAgentRequest =>
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
    note: UpdatedClarificationNote
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
}
