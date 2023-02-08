import { User, UserRole } from '@approved-premises/api'
import { RestClientBuilder, UserClient } from '../data'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  id: string
  name: string
  displayName: string
  roles: Array<UserRole>
}

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
}
