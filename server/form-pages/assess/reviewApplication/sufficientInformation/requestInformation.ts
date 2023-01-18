import type { DataServices } from '@approved-premises/ui'
import type { ApprovedPremisesAssessment as Assessment, User } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'request-information', bodyProperties: [] })
export default class RequestInformation implements TasklistPage {
  body = {}

  title = 'Request information from probation practicioner'

  user: User

  static async initialize(
    _body: Record<string, unknown>,
    assessment: Assessment,
    token: string,
    dataServices: DataServices,
  ) {
    const user = await dataServices.userService.getUserById(token, assessment.application.createdByUserId)

    const page = new RequestInformation()
    page.user = user

    return page
  }

  previous() {
    return 'sufficient-information'
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    return {}
  }
}
