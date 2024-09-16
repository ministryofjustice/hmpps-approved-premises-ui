import {
  ProbationRegion,
  SortDirection,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserRolesAndQualifications,
  UserSortField,
  type UserSummary,
} from '@approved-premises/api'
import { PaginatedResponse, UserDetails } from '@approved-premises/ui'
import { ReferenceDataClient, RestClientBuilder, UserClient } from '../data'
import { convertToTitleCase } from '../utils/utils'

export class DeliusAccountMissingStaffDetailsError extends Error {}

export default class UserService {
  constructor(
    private readonly userClientFactory: RestClientBuilder<UserClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getActingUser(token: string): Promise<UserDetails> {
    const client = this.userClientFactory(token)
    const profile = await client.getUserProfile()
    if (profile.loadError === 'staff_record_not_found') {
      throw new DeliusAccountMissingStaffDetailsError('Delius account missing staff details')
    }
    const user = profile.user as User
    return {
      name: user.deliusUsername,
      id: user.id,
      displayName: convertToTitleCase(user.name),
      permissions: user.permissions,
      roles: user.roles,
      active: user.isActive,
      apArea: user.apArea,
      version: user.version.toString(),
    }
  }

  async getUserById(token: string, id: string): Promise<User> {
    const client = this.userClientFactory(token)

    return client.getActingUser(id)
  }

  async getUserList(token: string, roles: Array<UserRole> = []): Promise<Array<UserSummary>> {
    const client = this.userClientFactory(token)
    return client.getUserList(roles)
  }

  async getUsers(
    token: string,
    areaId: string = '',
    roles: Array<UserRole> = [],
    qualifications: Array<UserQualification> = [],
    page: number = 1,
    sortBy: UserSortField = 'name',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<User>> {
    const client = this.userClientFactory(token)
    return client.getUsers(areaId, roles, qualifications, page, sortBy, sortDirection)
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
