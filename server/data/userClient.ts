import type { ApprovedPremisesUser as User, UserQualification, UserRole } from '@approved-premises/api'
import qs from 'qs'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

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
    const query = qs.stringify(
      {
        roles,
        qualifications,
      },
      { arrayFormat: 'comma', encode: false },
    )

    return (await this.restClient.get({ path: paths.users.index({}), query })) as Array<User>
  }
}
