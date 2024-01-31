import type { Request } from 'express'
import { DataServices } from '@approved-premises/ui'
import {
  ApprovedPremisesApplication as Application,
  PlacementApplication,
  PlacementApplicationDecisionEnvelope,
} from '@approved-premises/api'
import { RestClientBuilder } from '../data'
import PlacementApplicationClient from '../data/placementApplicationClient'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getBody, getPageName, getTaskName } from '../form-pages/utils'
import { ValidationError } from '../utils/errors'
import { placementApplicationSubmissionData } from '../utils/placementRequests/placementApplicationSubmissionData'
import { WithdrawPlacementRequestReason } from '../@types/shared/models/WithdrawPlacementRequestReason'

export default class PlacementApplicationService {
  constructor(private readonly placementApplicationClientFactory: RestClientBuilder<PlacementApplicationClient>) {}

  async getPlacementApplication(token: string, id: string): Promise<PlacementApplication> {
    const placementApplicationClient = this.placementApplicationClientFactory(token)

    return placementApplicationClient.find(id)
  }

  async create(token: string, applicationId: string): Promise<PlacementApplication> {
    const placementApplicationClient = this.placementApplicationClientFactory(token)
    return placementApplicationClient.create(applicationId)
  }

  async initializePage(
    Page: TasklistPageInterface,
    request: Request,
    dataServices: Partial<DataServices>,
    userInput?: Record<string, unknown>,
  ): Promise<TasklistPage> {
    const placementApplication = await this.getPlacementApplication(request.user.token, request.params.id)

    const body = getBody(Page, placementApplication, request, userInput)

    const page = Page.initialize
      ? await Page.initialize(body, placementApplication, request.user.token, dataServices)
      : new Page(body, placementApplication)

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const placementApplication = (await this.getPlacementApplication(
        request.user.token,
        request.params.id,
      )) as PlacementApplication
      const client = this.placementApplicationClientFactory(request.user.token)

      const pageName = getPageName(page.constructor)
      const taskName = getTaskName(page.constructor)

      placementApplication.data = placementApplication.data || {}
      placementApplication.data[taskName] = placementApplication.data[taskName] || {}
      placementApplication.data[taskName][pageName] = page.body

      await client.update(placementApplication)
    }
  }

  async submit(token: string, placementApplication: PlacementApplication, application: Application) {
    const placementApplicationClient = this.placementApplicationClientFactory(token)

    return placementApplicationClient.submission(
      placementApplication.id,
      placementApplicationSubmissionData(placementApplication, application),
    )
  }

  async submitDecision(
    token: string,
    placementApplicationId: string,
    decisionEnvelope: PlacementApplicationDecisionEnvelope,
  ) {
    const placementApplicationClient = this.placementApplicationClientFactory(token)

    return placementApplicationClient.decisionSubmission(placementApplicationId, decisionEnvelope)
  }

  async withdraw(token: string, placementApplicationId: string, reason: WithdrawPlacementRequestReason) {
    const placementApplicationClient = this.placementApplicationClientFactory(token)

    return placementApplicationClient.withdraw(placementApplicationId, reason)
  }
}
