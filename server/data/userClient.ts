import type {
  SortDirection,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserRolesAndQualifications,
  UserSortField,
} from '@approved-premises/api'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { PaginatedResponse } from '../@types/ui'

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

  async getUsers(
    region: string = '',
    roles: Array<UserRole> = [],
    qualifications: Array<UserQualification> = [],
    page = 1,
    sortBy: UserSortField = 'name',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<User>> {
    const filters = {} as Record<string, string>

    if (roles.length) {
      filters.roles = roles.join(',')
    }

    if (qualifications.length) {
      filters.qualifications = qualifications.join(',')
    }

    if (region) {
      filters.region = region
    }

    return this.restClient.getPaginatedResponse({
      path: paths.users.index({}),
      page: page.toString(),
      query: { ...filters, sortBy, sortDirection },
    })
  }

  async updateUser(userId: string, rolesAndQualifications: UserRolesAndQualifications): Promise<User> {
    return (await this.restClient.put({
      path: paths.users.update({ id: userId }),
      data: rolesAndQualifications,
    })) as User
  }

  search(name: string): Promise<Array<User>> {
    return this.restClient.get({ path: paths.users.search({}), query: { name } }) as Promise<Array<User>>
  }

  searchDelius(deliusUsername: string): Promise<User> {
    return this.restClient.get({ path: paths.users.searchDelius({}), query: { name: deliusUsername } }) as Promise<User>
  }

  async delete(id: string): Promise<void> {
    await this.restClient.delete(paths.users.delete({ id }))
  }
}
