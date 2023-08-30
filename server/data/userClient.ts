import type {
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { createQueryString } from '../utils/utils'

export default class UserClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getActingUser(id: string): Promise<User> {
    return (await this.restClient.get({ path: paths.users.show({ id }) })) as User
  }

  async getUserProfile(): Promise<User> {
    return (await this.restClient.get({ path: paths.users.profile({}) })) as User
  }

  async getUsers(roles: Array<UserRole> = [], qualifications: Array<UserQualification> = []): Promise<Array<User>> {
    const query = createQueryString(
      {
        roles,
        qualifications,
      },
      { arrayFormat: 'comma', encode: false },
    )

    return (await this.restClient.get({ path: paths.users.index({}), query })) as Array<User>
  }

  search(name: string): Promise<Array<User>> {
    return this.restClient.get({ path: paths.users.search({}), query: { name } }) as Promise<Array<User>>
  }
}
