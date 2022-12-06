import type { Request } from 'express'
import type { HtmlItem, TextItem, DataServices } from '@approved-premises/ui'
import type { ActiveOffence, Application } from '@approved-premises/api'

import type TasklistPage from '../form-pages/tasklistPage'
import type { RestClientBuilder, ApplicationClient, PersonClient } from '../data'
import { UnknownPageError, ValidationError } from '../utils/errors'

import Apply from '../form-pages/apply'
import paths from '../paths/apply'
import { DateFormats } from '../utils/dateUtils'
import { getArrivalDate, getPage } from '../utils/applicationUtils'

export default class ApplicationService {
  constructor(
    private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>,
    private readonly personClientFactory: RestClientBuilder<PersonClient>,
  ) {}

  async createApplication(token: string, crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.create(crn, activeOffence)

    return application
  }

  async findApplication(token: string, id: string): Promise<Application> {
    const applicationClient = this.applicationClientFactory(token)

    const application = await applicationClient.find(id)

    return application
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

  async submit(token: string, application: Application) {
    const client = this.applicationClientFactory(token)

    await client.submit(application)
  }

  private firstPageForTask(taskName: string) {
    return Object.keys(Apply.pages[taskName])[0]
  }

  private getApplicationFromSessionOrAPI(request: Request): Promise<Application> | Application {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(request.user.token, request.params.id)
  }

  private async saveToSession(application: Application, page: TasklistPage, request: Request) {
    request.session.application = application
    request.session.previousPage = request.params.page
  }

  private async saveToApi(application: Application, request: Request) {
    const client = this.applicationClientFactory(request.user.token)

    await client.update(application)
  }

  private getBody(application: Application, request: Request, userInput: Record<string, unknown>) {
    if (userInput && Object.keys(userInput).length) {
      return userInput
    }
    if (Object.keys(request.body).length) {
      return request.body
    }
    return this.getPageDataFromApplication(application, request)
  }

  private getPageDataFromApplication(application: Application, request: Request) {
    return application.data?.[request.params.task]?.[request.params.page] || {}
  }

  async dashboardTableRows(token: string): Promise<(TextItem | HtmlItem)[][]> {
    const applicationClient = this.applicationClientFactory(token)
    const personClient = this.personClientFactory(token)

    const applications = await applicationClient.all()

    const tableRows = Promise.all(
      applications.map(async application => {
        const { tier } = await personClient.risks(application.person.crn)

        return [
          this.createNameAnchorElement(application.person.name, application.id),
          this.textValue(application.person.crn),
          this.createTierBadge(tier.value.level),
          this.textValue(DateFormats.isoDateToUIDate(getArrivalDate(application), { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(application.submittedAt, { format: 'short' })),
        ]
      }),
    )

    return tableRows
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private createTierBadge(tier: string) {
    const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

    return this.htmlValue(`<span class="moj-badge ${colour}">${tier}</span>`)
  }

  private createNameAnchorElement(name: string, applicationId: string) {
    return this.htmlValue(`<a href=${paths.applications.show({ id: applicationId })}>${name}</a>`)
  }
}
