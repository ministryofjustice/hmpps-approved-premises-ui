import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../utils'

export const questionKeys = ['arson'] as const

type QuestionKeys = typeof questionKeys[number]

export default class Arson implements TasklistPage {
  name = 'arson'

  title = 'Arson'

  body: YesOrNoWithDetail<'arson'>

  questionPredicates = {
    arson: 'a specialist arson room',
  }

  questions = {
    arson: `Does ${this.application.person.name} need ${this.questionPredicates.arson}?`,
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      arson: body.arson,
      arsonDetail: body.arsonDetail,
    } as YesOrNoWithDetail<'arson'>
  }

  previous() {
    return 'catering'
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.questions.arson]: yesOrNoResponseWithDetail<QuestionKeys>('arson', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arson) {
      errors.arson = `You must specify if ${this.application.person.name} needs ${this.questionPredicates.arson}`
    }

    if (this.body.arson === 'yes' && !this.body.arsonDetail) {
      errors.arsonDetail = `You must specify details about if ${this.application.person.name} needs ${this.questionPredicates.arson}`
    }

    return errors
  }
}
