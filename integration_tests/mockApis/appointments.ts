import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AppointmentDto, OffenderFullDto } from '../../server/@types/shared'

export default {
  stubFindAppointment: ({ appointmentId }: { appointmentId: string }): SuperAgentRequest => {
    const pattern = paths.appointments.singleAppointment({ appointmentId })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...mockAppointment,
        },
      },
    })
  },
}
export const mockOffender: OffenderFullDto = {
  forename: 'John',
  surname: 'Smith',
  crn: 'CRN123',
  objectType: 'OffenderFull',
  middleNames: [],
}

export const mockAppointment: AppointmentDto = {
  id: 1001,
  projectName: 'Park cleaning',
  requirementMinutes: 600,
  completedMinutes: 500,
  offender: mockOffender,
}
