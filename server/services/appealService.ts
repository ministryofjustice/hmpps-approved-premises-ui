import type { RestClientBuilder } from '../data'

import { Appeal, NewAppeal } from '../@types/shared'
import AppealClient from '../data/appealClient'

export default class AppealService {
  constructor(private readonly appealClientFactory: RestClientBuilder<AppealClient>) {}

  async createAppeal(token: string, applicationId: string, appeal: NewAppeal): Promise<Appeal> {
    const client = this.appealClientFactory(token)

    return client.create(applicationId, appeal)
  }

  async getAppeal(token: string, applicationId: string, appealId: string): Promise<Appeal> {
    const client = this.appealClientFactory(token)

    return client.find(applicationId, appealId)
  }
}
