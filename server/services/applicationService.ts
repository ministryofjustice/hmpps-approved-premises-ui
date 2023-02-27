import type { Request } from 'express'
import type { DataServices, GroupedApplications } from '@approved-premises/ui'
import type {
  ActiveOffence,
  ApprovedPremisesApplication,
  ApprovedPremisesAssessment as Assessment,
  Document,
} from '@approved-premises/api'

import { applicationSubmissionData } from '../utils/applications/applicationSubmissionData'
import { isUnapplicable } from '../utils/applications/utils'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import type { ApplicationClient, RestClientBuilder } from '../data'
import { ValidationError } from '../utils/errors'

import { getBody, getPageName, getTaskName } from '../form-pages/utils'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(
    token: string,
    crn: string,
    activeOffence: ActiveOffence,
  ): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.create(crn, activeOffence)

    return application
  }

  async findApplication(token: string, id: string): Promise<ApprovedPremisesApplication> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.find(id)

    return application
  }

  async getAllForLoggedInUser(token: string): Promise<GroupedApplications> {
    const applicationClient = this.applicationClientFactory(token)
    const allApplications = await applicationClient.all()
    const result = {
      inProgress: [],
      requestedFurtherInformation: [],
      submitted: [],
    } as GroupedApplications

    const applications = allApplications.filter(application => !isUnapplicable(application))

    await Promise.all(
      applications.map(async application => {
        switch (application.status) {
          case 'submitted':
            result.submitted.push(application)
            break
          case 'requestedFurtherInformation':
            result.requestedFurtherInformation.push(application)
            break
          default:
            result.inProgress.push(application)
            break
        }
      }),
    )

    return result
  }

  async getDocuments(token: string, application: ApprovedPremisesApplication): Promise<Array<Document>> {
    const applicationClient = this.applicationClientFactory(token)

    const documents = await applicationClient.documents(application)

    return documents
  }

  async initializePage(
    Page: TasklistPageInterface,
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
    const application = await this.getApplicationFromSessionOrAPI(request)
    const body = getBody(Page, application, request, userInput)

    const page = Page.initialize
      ? await Page.initialize(body, application, request.user.token, dataServices)
      : new Page(body, application, request.session.previousPage)

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const application = await this.getApplicationFromSessionOrAPI(request)

      const pageName = getPageName(page.constructor)
      const taskName = getTaskName(page.constructor)

      application.data = application.data || {}
      application.data[taskName] = application.data[taskName] || {}
      application.data[taskName][pageName] = page.body

      this.saveToSession(application, page, request)
      await this.saveToApi(application, request)
    }
  }

  async submit(token: string, application: ApprovedPremisesApplication) {
    const client = this.applicationClientFactory(token)

    await client.submit(application.id, applicationSubmissionData(application))
  }

  async getApplicationFromSessionOrAPI(request: Request): Promise<ApprovedPremisesApplication> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(request.user.token, request.params.id)
  }

  async getAssessment(token: string, assessmentId: string): Promise<Assessment> {
    const client = this.applicationClientFactory(token)
    const assessment = await client.assessment(assessmentId)

    return assessment
  }

  async allocate(token: string, assessmentId: string, userId: string): Promise<Assessment> {
    const client = this.applicationClientFactory(token)
    const assessment = await client.allocate(assessmentId, userId)

    return assessment
  }

  private async saveToSession(application: ApprovedPremisesApplication, page: TasklistPage, request: Request) {
    request.session.application = application
    request.session.previousPage = request.params.page
  }

  private async saveToApi(application: ApprovedPremisesApplication, request: Request) {
    const client = this.applicationClientFactory(request.user.token)

    await client.update(application)
  }
}
