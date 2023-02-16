import type {
  ActiveOffence,
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
  Document,
  SubmitApplication,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(applicationId: string): Promise<Application> {
    return (await this.restClient.get({
      path: paths.applications.show({ id: applicationId }),
    })) as Application
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: `${paths.applications.new.pattern}?createWithRisks=${!config.flags.oasysDisabled}`,
      data: { crn, convictionId, deliusEventNumber, offenceId },
    })) as Application
  }

  async update(application: Application): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: application.id }),
      data: { data: application.data },
    })) as Application
  }

  async all(): Promise<Array<Application>> {
    return (await this.restClient.get({ path: paths.applications.index.pattern })) as Array<Application>
  }

  async submit(applicationId: string, submissionData: SubmitApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: applicationId }),
      data: { translatedDocument: submissionData },
    })
  }

  async documents(application: Application): Promise<Array<Document>> {
    return (await this.restClient.get({
      path: paths.applications.documents({ id: application.id }),
    })) as Array<Document>
  }

  async assessment(applicationId: string): Promise<Assessment> {
    return (await this.restClient.get({
      path: paths.applications.assessment({ id: applicationId }),
    })) as Assessment
  }

  async allocate(applicationId: string, userId: string): Promise<Assessment> {
    return (await this.restClient.post({
      path: paths.applications.allocation.create({ id: applicationId }),
      data: { userId },
    })) as Assessment
  }
}
