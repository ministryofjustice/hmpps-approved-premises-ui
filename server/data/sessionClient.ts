import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { ProjectAllocationsDto } from '../@types/shared'
import { GetSessionsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export default class SessionClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getSessions({ username, teamId, startDate, endDate }: GetSessionsRequest): Promise<ProjectAllocationsDto> {
    return (await this.get(
      { path: paths.projects.sessions({}), query: createQueryString({ startDate, endDate, teamId }) },
      asSystem(username),
    )) as ProjectAllocationsDto
  }
}
