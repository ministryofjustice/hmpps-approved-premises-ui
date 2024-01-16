import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { DataServices } from '../../../../@types/ui'
import { ApprovedPremisesUser, ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

@Page({
  name: 'sufficient-information-sent',
  bodyProperties: [],
})
export default class SufficientInformationSent implements TasklistPage {
  name = 'sufficient-information-sent'

  title = 'How to get further information'

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(public readonly body: Record<string, unknown>) {}

  user: ApprovedPremisesUser

  static async initialize(
    body: Record<string, unknown>,
    assessment: Assessment,
    token: string,
    dataServices: DataServices,
  ) {
    const user = await dataServices.userService.getUserById(token, assessment.application.createdByUserId)

    const page = new SufficientInformationSent(body)
    page.user = user

    return page
  }

  previous() {
    return ''
  }

  next() {
    return 'information-received'
  }

  response() {
    return {}
  }

  errors() {
    return {}
  }
}
