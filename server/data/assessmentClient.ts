import type { Assessment } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class AssessmentClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('assessmentClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<Assessment>> {
    return (await this.restClient.get({ path: paths.assessments.index.pattern })) as Array<Assessment>
  }

  async find(applicationId: string): Promise<Assessment> {
    return (await this.restClient.get({ path: paths.assessments.show({ id: applicationId }) })) as Assessment
  }
}
