import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../utils'

export const questionKeys = ['complexCaseBoard'] as const

type QuestionKeys = typeof questionKeys[number]

export default class ComplexCaseBoard implements TasklistPage {
  name = 'complex-case-board'

  title = 'Complex case board'

  body: YesOrNoWithDetail<'complexCaseBoard'>

  questionPredicates = {
    complexCaseBoard: `gender identity require a complex case board to review their application`,
  }

  questions = {
    complexCaseBoard: `Does ${this.application.person.name}'s ${this.questionPredicates.complexCaseBoard}?`,
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      complexCaseBoard: body.complexCaseBoard,
      complexCaseBoardDetail: body.complexCaseBoardDetail,
    } as YesOrNoWithDetail<'complexCaseBoard'>
  }

  previous() {
    return 'previous-placements'
  }

  next() {
    return ''
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
