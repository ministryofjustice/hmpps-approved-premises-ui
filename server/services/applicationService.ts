import type { Request } from 'express'
import type {
  ApplicationDashboardSearchOptions,
  DataServices,
  GroupedApplications,
  PaginatedResponse,
} from '@approved-premises/ui'
import type {
  ActiveOffence,
  ApprovedPremisesApplication as Application,
  ApplicationSortField,
  ApplicationTimelineNote,
  Document,
  NewWithdrawal,
  SortDirection,
  Cas1ApplicationSummary,
  Cas1ExpireApplicationReason,
} from '@approved-premises/api'

import { updateFormArtifactData } from '../form-pages/utils/updateFormArtifactData'
import { getApplicationSubmissionData, getApplicationUpdateData } from '../utils/applications/getApplicationData'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import type { ApplicationClient, RestClientBuilder } from '../data'
import { ValidationError } from '../utils/errors'

import { getBody } from '../form-pages/utils'
import Review from '../form-pages/apply/check-your-answers/review'

export default class ApplicationService {
  constructor(private readonly applicationClientFactory: RestClientBuilder<ApplicationClient>) {}

  async createApplication(token: string, crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const applicationClient = this.applicationClientFactory(token)

    return applicationClient.create(crn, activeOffence)
  }

  async findApplication(token: string, id: string): Promise<Application> {
    const applicationClient = this.applicationClientFactory(token)

    return applicationClient.find(id)
  }

  async getAll(
    token: string,
    page: number = 1,
    sortBy: ApplicationSortField = 'createdAt',
    sortDirection: SortDirection = 'asc',
    searchOptions: ApplicationDashboardSearchOptions = {},
    pageSize: number = 10,
  ): Promise<PaginatedResponse<Cas1ApplicationSummary>> {
    const applicationClient = this.applicationClientFactory(token)

    return applicationClient.all(page, sortBy, sortDirection, searchOptions, pageSize)
  }

  async getAllForLoggedInUser(token: string): Promise<GroupedApplications> {
    const applicationClient = this.applicationClientFactory(token)
    const allApplications = await applicationClient.allForLoggedInUser()
    const result: GroupedApplications = {
      inProgress: [],
      requestedFurtherInformation: [],
      submitted: [],
      inactive: [],
    }

    await Promise.all(
      allApplications.map(async application => {
        switch (application.status) {
          case 'started':
            result.inProgress.push(application)
            break
          case 'requestedFurtherInformation':
            result.requestedFurtherInformation.push(application)
            break
          case 'expired':
          case 'withdrawn':
          case 'rejected':
          case 'inapplicable':
            result.inactive.push(application)
            break
          default:
            result.submitted.push(application)
            break
        }
      }),
    )

    return result
  }

  async getDocuments(token: string, application: Application): Promise<Array<Document>> {
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
    const application = await this.findApplication(request.user.token, request.params.id)
    const body = getBody(Page, application, request, userInput)

    const page = Page.initialize
      ? await Page.initialize(body, application, request.user.token, dataServices)
      : new Page(body, application)

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const application = await this.findApplication(request.user.token, request.params.id)
      const updatedApplication = updateFormArtifactData(page, application, Review)

      const client = this.applicationClientFactory(request.user.token)

      await client.update(application.id, getApplicationUpdateData(updatedApplication))
    }
  }

  async submit(token: string, application: Application) {
    const client = this.applicationClientFactory(token)

    await client.submit(application.id, getApplicationSubmissionData(application))
  }

  async getApplicationFromSessionOrAPI(request: Request): Promise<Application> {
    const { application } = request.session

    if (application && application.id === request.params.id) {
      return application
    }
    return this.findApplication(request.user.token, request.params.id)
  }

  async withdraw(token: string, applicationId: string, body: NewWithdrawal) {
    const client = this.applicationClientFactory(token)

    await client.withdrawal(applicationId, body)
  }

  async expire(token: string, applicationId: string, body: Cas1ExpireApplicationReason) {
    const client = this.applicationClientFactory(token)

    await client.expire(applicationId, body)
  }

  async timeline(token: string, applicationId: string) {
    const client = this.applicationClientFactory(token)

    const timeline = await client.timeline(applicationId)

    return timeline
  }

  async getRequestsForPlacement(token: string, applicationId: string) {
    const client = this.applicationClientFactory(token)

    const requestsForPlacement = await client.requestsForPlacement(applicationId)

    return requestsForPlacement
  }

  async addNote(token: Request['user']['token'], applicationId: Application['id'], note: ApplicationTimelineNote) {
    const client = this.applicationClientFactory(token)

    const addedNote = await client.addNote(applicationId, note)

    return addedNote
  }

  async getWithdrawablesWithNotes(token: Request['user']['token'], applicationId: Application['id']) {
    const client = this.applicationClientFactory(token)

    const withdrawables = await client.withdrawablesWithNotes(applicationId)

    return withdrawables
  }
}
