import { AppointmentsDto, ProjectAllocationsDto } from '../@types/shared'
import { GetSessionsRequest } from '../@types/user-defined'
import SessionClient from '../data/sessionClient'

export default class SessionService {
  constructor(private readonly sessionClient: SessionClient) {}

  async getSessions({ username, teamId, startDate, endDate }: GetSessionsRequest): Promise<ProjectAllocationsDto> {
    const sessions = await this.sessionClient.getSessions({ username, teamId, startDate, endDate })

    return sessions
  }

  async getSession(username: string, projectId: string, date: string): Promise<AppointmentsDto> {
    const appointments = this.sessionClient.find(username, projectId, date)

    return appointments
  }
}
