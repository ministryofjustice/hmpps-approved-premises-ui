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
    return this.restClient.get<Appeal>({
      path: paths.applications.appeals.show({ id: applicationId, appealId }),
    })
  }

  async create(applicationId: string, appeal: NewAppeal): Promise<Appeal> {
    return this.restClient.post<Appeal>({
      path: paths.applications.appeals.create({ id: applicationId }),
      data: appeal,
    })
  }
}
