import { User } from '@approved-premises/api'
import { RestClientBuilder, UserClient } from '../data'
import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly userClientFactory: RestClientBuilder<UserClient>,
  ) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getUserById(token: string, id: string): Promise<User> {
    const client = this.userClientFactory(token)

    return client.getUser(id)
  }
}
