import type {
  Cas1UpdateUser,
  ProfileResponse,
  SortDirection,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserSortField,
  UserSummary,
  ApprovedPremisesUserPermission as UserPermission,
} from '@approved-premises/api'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { PaginatedResponse } from '../@types/ui'

export type UsersSearchParams = {
  roles?: Array<UserRole>
  permission?: UserPermission
  nameOrEmail?: string
  page: number
}

export default class UserClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getUser(id: string): Promise<User> {
    return (await this.restClient.get({ path: paths.users.show({ id }) })) as User
  }

  async getUserProfile(): Promise<ProfileResponse> {
    return (await this.restClient.get({ path: paths.users.profile({}) })) as ProfileResponse
  }

  async getUsersSummaries(filters: UsersSearchParams = { page: 1 }): Promise<PaginatedResponse<UserSummary>> {
    const query = {
      roles: filters.roles?.length ? filters.roles.join(',') : undefined,
      permission: filters.permission,
      nameOrEmail: filters.nameOrEmail,
    }

    return this.restClient.getPaginatedResponse({
      path: paths.users.summary({}),
      page: filters.page.toString(),
      query,
    })
  }

  async getUserList(roles: Array<UserRole> = []): Promise<Array<UserSummary>> {
    return (await this.restClient.get({
      path: paths.users.summary({}),
      query: { roles: roles.join(',') },
    })) as Promise<Array<UserSummary>>
  }

  async getUsers(
    cruManagementAreaId: string = '',
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

    if (cruManagementAreaId) {
      filters.cruManagementAreaId = cruManagementAreaId
    }

    return this.restClient.getPaginatedResponse({
      path: paths.users.index({}),
      page: page.toString(),
      query: { ...filters, sortBy, sortDirection },
    })
  }

  async updateUser(userId: string, data: Cas1UpdateUser): Promise<User> {
    return (await this.restClient.put({
      path: paths.users.update({ id: userId }),
      data,
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
