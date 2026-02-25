import type {
  Cas1UpdateUser,
  SortDirection,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserSortField,
  UserSummary,
  ApprovedPremisesUserPermission as UserPermission,
  Cas1ProfileResponse,
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

export type UsersSearchFilters = {
  cruManagementAreaId?: string
  roles?: Array<UserRole>
  qualifications?: Array<UserQualification>
  nameOrEmail?: string
}

export default class UserClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('userClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getUser(id: string): Promise<User> {
    return this.restClient.get<User>({ path: paths.users.show({ id }) })
  }

  async getUserProfile(): Promise<Cas1ProfileResponse> {
    return this.restClient.get<Cas1ProfileResponse>({ path: paths.users.profile({}) })
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
    return this.restClient.get<Array<UserSummary>>({
      path: paths.users.summary({}),
      query: { roles: roles.join(',') },
    })
  }

  async getUsers(
    filters: UsersSearchFilters = {},
    page = 1,
    sortBy: UserSortField = 'name',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<User>> {
    const { nameOrEmail, cruManagementAreaId } = filters
    const roles = filters.roles ? filters.roles.join(',') : undefined
    const qualifications = filters.qualifications ? filters.qualifications.join(',') : undefined

    return this.restClient.getPaginatedResponse<User>({
      path: paths.users.index({}),
      page: page.toString(),
      query: { nameOrEmail, cruManagementAreaId, roles, qualifications, sortBy, sortDirection },
    })
  }

  async updateUser(userId: string, data: Cas1UpdateUser): Promise<User> {
    return this.restClient.put<User>({
      path: paths.users.update({ id: userId }),
      data,
    })
  }

  search(name: string): Promise<Array<User>> {
    return this.restClient.get<Array<User>>({ path: paths.users.search({}), query: { name } })
  }

  searchDelius(deliusUsername: string): Promise<User> {
    return this.restClient.get<User>({ path: paths.users.searchDelius({}), query: { name: deliusUsername } })
  }

  async delete(id: string): Promise<void> {
    await this.restClient.delete(paths.users.delete({ id }))
  }
}
