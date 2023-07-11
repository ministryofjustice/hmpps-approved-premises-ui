import type { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { ApprovedPremisesApplication as Application, PlacementApplication } from '../../../@types/shared'

type Body = { reviewed?: string }

@Page({ name: 'check-your-answers', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'check-your-answers'

  title = 'Check your answers'

  placementApplication: PlacementApplication

  application: Application

  static async initialize(
    body: Body,
    placementApplication: PlacementApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<Review> {
    const application = await dataServices.applicationService.findApplication(token, placementApplication.applicationId)

    const page = new Review(body, placementApplication)

    page.application = application

    return page
  }

  constructor(
    public body: Body,
    placementApplication: PlacementApplication,
  ) {
    this.placementApplication = placementApplication
  }

  previous() {
    return 'updates-to-application'
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
