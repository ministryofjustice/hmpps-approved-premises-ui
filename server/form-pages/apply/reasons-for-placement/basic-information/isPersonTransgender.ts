import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'transgender', bodyProperties: ['transgenderOrHasTransgenderHistory'] })
export default class IsPersonTransgender implements TasklistPage {
  question = `Is the person transgender or do they have a transgender history?`

  title = this.question

  constructor(public body: { transgenderOrHasTransgenderHistory: YesOrNo }) {}

  previous() {
    return 'confirm-your-details'
  }

  next() {
    return this.body.transgenderOrHasTransgenderHistory === 'yes' ? 'male-ap' : 'relevant-dates'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.transgenderOrHasTransgenderHistory),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.transgenderOrHasTransgenderHistory) {
      errors.transgenderOrHasTransgenderHistory = `You must specify if the person is transgender of if they have a transgender history`
    }

    return errors
  }
}
