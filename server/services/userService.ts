import {
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import { RestClientBuilder, UserClient } from '../data'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
  ) {}

  async getActingUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getActingUser(token)
    const client = this.userClientFactory(token)
    const profile = await client.getUserProfile()
    return { ...user, id: profile.id, displayName: convertToTitleCase(user.name), roles: profile.roles }
  }

  async getUserById(token: string, id: string): Promise<User> {
    const client = this.userClientFactory(token)

    return client.getActingUser(id)
  }

  async getUsers(
    token: string,
    roles: Array<UserRole> = [],
    qualifications: Array<UserQualification> = [],
  ): Promise<Array<User>> {
    const client = this.userClientFactory(token)

    return client.getUsers(roles, qualifications)
  }

  async updateUser(token: string, user: User): Promise<User> {
    const client = this.userClientFactory(token)

    return client.updateUser(user)
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
}
