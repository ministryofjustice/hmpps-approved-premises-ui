import {
  ProbationRegion,
  SortDirection,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserRolesAndQualifications,
  UserSortField,
} from '@approved-premises/api'
import { PaginatedResponse, UserDetails } from '@approved-premises/ui'
import { ReferenceDataClient, RestClientBuilder, UserClient } from '../data'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getActingUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getActingUser(token)
    const client = this.userClientFactory(token)
    const profile = await client.getUserProfile()
    return {
      ...user,
      id: profile.id,
      displayName: convertToTitleCase(user.name),
      roles: profile.roles,
      active: profile.isActive,
    }
  }

  async getUserById(token: string, id: string): Promise<User> {
    const client = this.userClientFactory(token)

    return client.getActingUser(id)
  }

  async getUsers(
    token: string,
    region: string = '',
    roles: Array<UserRole> = [],
    qualifications: Array<UserQualification> = [],
    page: number = 1,
    sortBy: UserSortField = 'name',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<User>> {
    const client = this.userClientFactory(token)
    return client.getUsers(region, roles, qualifications, page, sortBy, sortDirection)
  }

  async updateUser(token: string, userId: string, rolesAndQualifications: UserRolesAndQualifications): Promise<User> {
    const client = this.userClientFactory(token)

    return client.updateUser(userId, rolesAndQualifications)
  }

  async search(token: string, query: string): Promise<Array<User>> {
    const client = this.userClientFactory(token)

    return client.search(query)
  }

  async searchDelius(token: string, query: string): Promise<User> {
    const client = this.userClientFactory(token)

    return client.searchDelius(query)
  }

  async delete(token: string, id: string): Promise<void> {
    const client = this.userClientFactory(token)

    await client.delete(id)
  }

  async getProbationRegions(token: string): Promise<Array<ProbationRegion>> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    return referenceDataClient.getProbationRegions()
  }
}
