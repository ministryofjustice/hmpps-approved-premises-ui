import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { EnforcementActionsDto, ProjectTypesDto } from '../@types/shared'

export default class ReferenceDataClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('referenceDataClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  getProjectTypes(username: string): Promise<ProjectTypesDto> {
    const path = paths.referenceData.projectTypes.pattern
    return this.get({ path }, asSystem(username))
  }

  getEnforcementActions(username: string): Promise<EnforcementActionsDto> {
    const path = paths.referenceData.enforcementActions.pattern
    return this.get({ path }, asSystem(username))
  }
}
