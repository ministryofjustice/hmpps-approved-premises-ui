import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForNo } from '../../../utils'

export const questionKeys = ['catering'] as const

type QuestionKeys = (typeof questionKeys)[number]
@Page({ name: 'catering', bodyProperties: ['catering', 'cateringDetail'] })
export default class Catering implements TasklistPage {
  title = 'Catering requirements'

  questionPredicates = {
    catering: 'be placed in a self-catered Approved Premises (AP)',
  }

  questions = {
    catering: `Can ${this.application.person.name} ${this.questionPredicates.catering}?`,
  }

  constructor(
    public body: Partial<YesOrNoWithDetail<'catering'>>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'complex-case-board'
  }

  next() {
    return 'arson'
  }

  response() {
    return {
      [this.questions.catering]: yesOrNoResponseWithDetailForNo<QuestionKeys>('catering', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.catering) {
      errors.catering = `You must specify if ${this.application.person.name} can ${this.questionPredicates.catering}`
    }

    if (this.body.catering === 'no' && !this.body.cateringDetail) {
      errors.cateringDetail = `You must specify details if you have any concerns about ${this.application.person.name} catering for themselves`
    }

    return errors
  }
}
