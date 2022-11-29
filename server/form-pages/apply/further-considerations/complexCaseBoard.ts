import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../utils'

export const questionKeys = ['complexCaseBoard'] as const

type QuestionKeys = typeof questionKeys[number]

@Page({ name: 'complex-case-board', bodyProperties: ['complexCaseBoard', 'complexCaseBoardDetail'] })
export default class ComplexCaseBoard implements TasklistPage {
  title = 'Complex case board'

  questionPredicates = {
    complexCaseBoard: `gender identity require a complex case board to review their application`,
  }

  questions = {
    complexCaseBoard: `Does ${this.application.person.name}'s ${this.questionPredicates.complexCaseBoard}?`,
  }

  constructor(public body: Partial<YesOrNoWithDetail<'complexCaseBoard'>>, private readonly application: Application) {}

  previous() {
    return 'previous-placements'
  }

  next() {
    return 'catering'
  }

  response() {
    return {
      [this.questions.complexCaseBoard]: yesOrNoResponseWithDetail<QuestionKeys>('complexCaseBoard', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.complexCaseBoard) {
      errors.complexCaseBoard = `You must specify if ${this.application.person.name}'s gender identity requires a complex case board to review their application`
    }

    if (this.body.complexCaseBoard === 'yes' && !this.body.complexCaseBoardDetail) {
      errors.complexCaseBoardDetail = `You must specify details about if ${this.application.person.name}'s gender identity requires a complex case board to review their application`
    }

    return errors
  }
}
