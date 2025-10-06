import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProjectAllocationsDto, SessionDto } from '../../server/@types/shared'
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
      teamCode: {
        equalTo: request.teamCode,
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
  stubFindSession: ({
    projectId,
    responseHasLimitedOffenders = false,
  }: {
    projectId: string
    responseHasLimitedOffenders: boolean
  }): SuperAgentRequest => {
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
          ...mockAppointments(responseHasLimitedOffenders),
        },
      },
    })
  },
}

export const mockAppointments = (hasLimitedOffenders: boolean = false): SessionDto => ({
  projectName: 'Park cleaning',
  projectCode: 'XCT12',
  projectLocation: 'Hammersmith',
  date: '2025-01-02',
  startTime: '11:00',
  endTime: '12:00',
  appointmentSummaries: [
    {
      id: 1001,
      requirementMinutes: 600,
      completedMinutes: 500,
      offender: hasLimitedOffenders
        ? {
            crn: 'CRN123',
            objectType: 'Limited',
          }
        : {
            forename: 'John',
            surname: 'Smith',
            crn: 'CRN123',
            objectType: 'Full',
          },
    },
    {
      id: 1002,
      requirementMinutes: 900,
      completedMinutes: 600,
      offender: hasLimitedOffenders
        ? {
            crn: 'CRN124',
            objectType: 'Limited',
          }
        : {
            forename: 'Roberta',
            surname: 'John',
            crn: 'CRN124',
            objectType: 'Full',
          },
    },
  ],
})
