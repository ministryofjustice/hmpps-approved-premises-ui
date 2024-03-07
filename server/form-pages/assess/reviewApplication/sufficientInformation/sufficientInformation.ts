import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'

@Page({
  name: 'sufficient-information',
  bodyProperties: ['sufficientInformation', 'query'],
})
export default class SufficientInformation implements TasklistPage {
  name = 'sufficient-information'

  title = 'Is there enough information in the application for you to make a decision?'

  furtherInformationQuestion = 'What additional information is needed?'

  constructor(public body: { sufficientInformation?: YesOrNo; query?: string }) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.sufficientInformation === 'no' ? 'sufficient-information-confirm' : ''
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
      errors.query = 'You must specify what additional information is needed'
    }

    return errors
  }
}
