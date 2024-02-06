import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import { Appeal, NewAppeal } from '../@types/shared'
import paths from '../paths/api'

export default class AppealClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(applicationId: string, appealId: string): Promise<Appeal> {
    return (await this.restClient.get({
      path: paths.applications.appeals.show({ id: applicationId, appealId }),
    })) as Appeal
  }

  async create(applicationId: string, appeal: NewAppeal): Promise<Appeal> {
    return (await this.restClient.post({
      path: paths.applications.appeals.create({ id: applicationId }),
      data: appeal,
    })) as Appeal
  }
}
