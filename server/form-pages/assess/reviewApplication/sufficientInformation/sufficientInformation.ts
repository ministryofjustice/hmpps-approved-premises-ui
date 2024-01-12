import type { DataServices, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesAssessment as Assessment, User } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'

@Page({
  name: 'sufficient-information',
  bodyProperties: ['sufficientInformation', 'query'],
  controllerActions: { update: 'updateSufficientInformation' },
})
export default class SufficientInformation implements TasklistPage {
  name = 'sufficient-information'

  title = 'Is there enough information in the application for you to make a decision?'

  furtherInformationQuestion = 'What additional information is required?'

  user: User

  constructor(public body: { sufficientInformation?: YesOrNo; query?: string }) {}

  static async initialize(
    body: Record<string, unknown>,
    assessment: Assessment,
    token: string,
    dataServices: DataServices,
  ) {
    const user = await dataServices.userService.getUserById(token, assessment.application.createdByUserId)

    const page = new SufficientInformation(body)
    page.user = user

    return page
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.sufficientInformation === 'yes' ? '' : 'information-received'
  }

  response() {
    return {
      [`${this.title}`]: sentenceCase(this.body.sufficientInformation),
      [`${this.furtherInformationQuestion}`]: this.body?.query ?? '',
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sufficientInformation)
      errors.sufficientInformation =
        'You must confirm if there is enough information in the application to make a decision'

    if (this.body.sufficientInformation === 'no' && !this.body.query) {
      errors.query = 'You must specify what additional information is required'
    }

    return errors
  }
}
