import type { ActiveOffence, Application } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(applicationId: string): Promise<Application> {
    return (await this.restClient.get({ path: paths.applications.show({ id: applicationId }) })) as Application
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: paths.applications.new.pattern,
      data: { crn, convictionId, deliusEventNumber, offenceId },
    })) as Application
  }

  async update(application: Application): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: application.id }),
      data: { data: application.data },
    })) as Application
  }

  async all(): Promise<Application[]> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as Application[]
  }

  async submit(application: Application): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: application.id }),
      data: { translatedDocument: application.document },
    })
  }
}
