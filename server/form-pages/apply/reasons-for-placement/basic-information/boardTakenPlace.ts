import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'board-taken-place', bodyProperties: ['hasBoardTakenPlace'] })
export default class BoardTakenPlace implements TasklistPage {
  question = 'Has the Complex Case Board taken place?'

  title = this.question

  constructor(public body: { hasBoardTakenPlace: YesOrNo }) {}

  previous() {
    return 'complex-case-board'
  }

  next() {
    return 'relevant-dates'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.hasBoardTakenPlace),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.hasBoardTakenPlace) {
      errors.hasBoardTakenPlace = 'You must specify if the Complex Case Board has taken place'
    }

    return errors
  }
}
