import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'complex-case-board', bodyProperties: ['reviewRequired'] })
export default class ComplexCaseBoard implements TasklistPage {
  question = `Does the person's gender identity require a complex case board to review their application?`

  title = this.question

  constructor(public body: { reviewRequired: YesOrNo }) {}

  previous() {
    return 'transgender'
  }

  next() {
    return this.body.reviewRequired === 'yes' ? 'board-taken-place' : 'sentence-type'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.reviewRequired),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reviewRequired) {
      errors.reviewRequired = `You must specify if the person's gender identity requires a complex case board to review their application`
    }

    return errors
  }
}
