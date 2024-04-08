import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { User } from './hmppsAuthClient'

export default class ManageUsersApiClient {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.manageUsersApi, token)
  }

  getActingUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return ManageUsersApiClient.restClient(token).get({ path: '/users/me' }) as Promise<User>
  }
}
