import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'male-ap', bodyProperties: ['shouldPersonBePlacedInMaleAp'] })
export default class MaleAp implements TasklistPage {
  question = 'What type of AP does the person need?'

  title = this.question

  yesText = "Men's AP"

  noText = "Women's AP"

  constructor(public body: { shouldPersonBePlacedInMaleAp: YesOrNo }) {}

  previous() {
    return 'transgender'
  }

  next() {
    return 'complex-case-board'
  }

  response() {
    return {
      [this.question]: this.body.shouldPersonBePlacedInMaleAp === 'yes' ? this.yesText : this.noText,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.shouldPersonBePlacedInMaleAp) {
      errors.shouldPersonBePlacedInMaleAp = 'You must specify what type of AP the complex case board has agreed to'
    }

    return errors
  }
}
