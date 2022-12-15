import type { Request } from 'express'
import type { DataServices } from '@approved-premises/ui'
import type { ActiveOffence, ApprovedPremisesApplication, Document } from '@approved-premises/api'

import type TasklistPage from '../form-pages/tasklistPage'
import type { RestClientBuilder, ApplicationClient } from '../data'
import { UnknownPageError, ValidationError } from '../utils/errors'

import Apply from '../form-pages/apply'
import { getPage } from '../utils/applicationUtils'

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

  async getAllForLoggedInUser(token: string): Promise<Array<ApprovedPremisesApplication>> {
    const applicationClient = this.applicationClientFactory(token)

    return applicationClient.all()
  }

  async getDocuments(token: string, application: ApprovedPremisesApplication): Promise<Array<Document>> {
    const applicationClient = this.applicationClientFactory(token)

    const documents = await applicationClient.documents(application)

    return documents
  }

  async getCurrentPage(
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
    if (!request.params.task) {
      throw new UnknownPageError()
    }

    request.params.page = request.params.page || this.firstPageForTask(request.params.task)

    const Page = getPage(request.params.task, request.params.page)

    const application = await this.getApplicationFromSessionOrAPI(request)
    const body = this.getBody(application, request, userInput)

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

      application.data = application.data || {}
      application.data[request.params.task] = application.data[request.params.task] || {}
      application.data[request.params.task][request.params.page] = page.body

      this.saveToSession(application, page, request)
      await this.saveToApi(application, request)
    }
  }

  async submit(token: string, application: ApprovedPremisesApplication) {
    const client = this.applicationClientFactory(token)

    await client.submit(application)
  }

  async getApplicationFromSessionOrAPI(request: Request): Promise<ApprovedPremisesApplication> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(request.user.token, request.params.id)
  }

  private firstPageForTask(taskName: string) {
    return Object.keys(Apply.pages[taskName])[0]
  }

  private async saveToSession(application: ApprovedPremisesApplication, page: TasklistPage, request: Request) {
    request.session.application = application
    request.session.previousPage = request.params.page
  }

  private async saveToApi(application: ApprovedPremisesApplication, request: Request) {
    const client = this.applicationClientFactory(request.user.token)

    await client.update(application)
  }

  private getBody(application: ApprovedPremisesApplication, request: Request, userInput: Record<string, unknown>) {
    if (userInput && Object.keys(userInput).length) {
      return userInput
    }
    if (Object.keys(request.body).length) {
      return request.body
    }
    return this.getPageDataFromApplication(application, request)
  }

  private getPageDataFromApplication(application: ApprovedPremisesApplication, request: Request) {
    return application.data?.[request.params.task]?.[request.params.page] || {}
  }
}
