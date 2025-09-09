import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'

export default class CommunityPaybackApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Community Payback API', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  getExampleData(username: string) {
    return this.get({ path: '/example' }, asSystem(username))
  }
}
