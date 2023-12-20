import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'male-ap', bodyProperties: ['shouldPersonBePlacedInMaleAp'] })
export default class MaleAp implements TasklistPage {
  question = 'Has the Complex Case Board determined that the person should be placed in a male AP?'

  title = this.question

  constructor(public body: { shouldPersonBePlacedInMaleAp: YesOrNo }) {}

  previous() {
    return 'board-taken-place'
  }

  next() {
    return this.body.shouldPersonBePlacedInMaleAp === 'yes' ? 'relevant-dates' : 'refer-to-delius'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.shouldPersonBePlacedInMaleAp),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.shouldPersonBePlacedInMaleAp) {
      errors.shouldPersonBePlacedInMaleAp =
        'You must specify if the Complex Case Board determined that the person should be placed in a male AP'
    }

    return errors
  }
}
