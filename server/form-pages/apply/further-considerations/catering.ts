import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../utils'

export const questionKeys = ['catering'] as const

type QuestionKeys = typeof questionKeys[number]

export default class Catering implements TasklistPage {
  name = 'catering'

  title = 'Catering requirements'

  body: YesOrNoWithDetail<'catering'>

  questionPredicates = {
    catering: 'catering for themselves',
  }

  questions = {
    catering: `Do you have any concerns about ${this.application.person.name} ${this.questionPredicates.catering}?`,
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      catering: body.catering,
      cateringDetail: body.cateringDetail,
    } as YesOrNoWithDetail<'catering'>
  }

  previous() {
    return 'complex-case-board'
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.questions.catering]: yesOrNoResponseWithDetail<QuestionKeys>('catering', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.catering) {
      errors.catering = `You must specify if you have any concerns about ${this.application.person.name} ${this.questionPredicates.catering}`
    }

    if (this.body.catering === 'yes' && !this.body.cateringDetail) {
      errors.cateringDetail = `You must specify details about if you have any concerns about ${this.application.person.name} ${this.questionPredicates.catering}`
    }

    return errors
  }
}
