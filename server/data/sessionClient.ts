import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { ProjectAllocationsDto, SessionDto } from '../@types/shared'
import { GetSessionsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export default class SessionClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getSessions({ username, teamCode, startDate, endDate }: GetSessionsRequest): Promise<ProjectAllocationsDto> {
    return (await this.get(
      { path: paths.projects.sessions({}), query: createQueryString({ startDate, endDate, teamCode }) },
      asSystem(username),
    )) as ProjectAllocationsDto
  }

  async find(username: string, projectId: string, date: string): Promise<SessionDto> {
    const path = paths.projects.sessionAppointments({ projectId })
    const query = createQueryString({ date })
    return (await this.get({ path, query }, asSystem(username))) as SessionDto
  }
}
