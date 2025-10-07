import { SessionSummariesDto, SessionDto } from '../@types/shared'
import { GetSessionsRequest } from '../@types/user-defined'
import SessionClient from '../data/sessionClient'

export default class SessionService {
  constructor(private readonly sessionClient: SessionClient) {}

  async getSessions({ username, teamCode, startDate, endDate }: GetSessionsRequest): Promise<SessionSummariesDto> {
    const sessions = await this.sessionClient.getSessions({ username, teamCode, startDate, endDate })

    return sessions
  }

  async getSession(username: string, projectId: string, date: string): Promise<SessionDto> {
    const appointments = this.sessionClient.find(username, projectId, date)

    return appointments
  }
}
