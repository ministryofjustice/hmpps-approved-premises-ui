import { TaskData } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class FormDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('formClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async get(id: string): Promise<TaskData> {
    return this.restClient.get<TaskData>({ path: paths.formData({ id }) })
  }

  async update(id: string, formData: TaskData): Promise<{ id: string }> {
    return this.restClient.put<{ id: string }>({
      path: paths.formData({ id }),
      data: { ...formData },
    })
  }
}
