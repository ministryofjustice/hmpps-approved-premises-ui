import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProjectAllocationsDto, AppointmentsDto } from '../../server/@types/shared'
import type { GetSessionsRequest } from '../../server/@types/user-defined'

export default {
  stubGetSessions: ({
    request,
    sessions,
  }: {
    request: GetSessionsRequest
    sessions: ProjectAllocationsDto
  }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      teamId: {
        equalTo: request.teamId.toString(),
      },
      startDate: {
        equalTo: request.startDate,
      },
      endDate: {
        equalTo: request.endDate,
      },
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPath: paths.projects.sessions.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessions,
      },
    })
  },
  stubFindSession: ({ projectId }: { projectId: string }): SuperAgentRequest => {
    const pattern = paths.projects.sessionAppointments({ projectId })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...mockAppointments,
        },
      },
    })
  },
}

export const mockAppointments: AppointmentsDto = {
  appointments: [
    {
      id: 1001,
      projectName: 'Park cleaning',
      requirementMinutes: 600,
      completedMinutes: 500,
      offender: {
        forename: 'John',
        surname: 'Smith',
        crn: 'CRN123',
        objectType: 'OffenderFull',
      },
    },
    {
      id: 1002,
      projectName: 'Park cleaning',
      requirementMinutes: 900,
      completedMinutes: 600,
      offender: {
        forename: 'Roberta',
        surname: 'John',
        crn: 'CRN124',
        objectType: 'OffenderFull',
      },
    },
  ],
}
