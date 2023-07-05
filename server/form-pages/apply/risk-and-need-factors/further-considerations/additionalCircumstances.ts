import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForYes } from '../../../utils'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from '../../../../utils/applications/shouldShowContingencyPlanPages'

export const questionKeys = ['additionalCircumstances'] as const

type QuestionKeys = (typeof questionKeys)[number]

@Page({
  name: 'additional-circumstances',
  bodyProperties: ['additionalCircumstances', 'additionalCircumstancesDetail'],
})
export default class AdditionalCircumstances implements TasklistPage {
  title = 'Additional circumstances'

  questionPredicates = {
    additionalCircumstances: 'do well in the past',
  }

  questions = {
    additionalCircumstances: `Are there are any additional circumstances that have helped ${this.application.person.name} ${this.questionPredicates.additionalCircumstances}?`,
  }

  constructor(
    public body: Partial<YesOrNoWithDetail<'additionalCircumstances'>>,
    private readonly application: Application,
  ) {}

  previous() {
    return 'arson'
  }

  next() {
    if (shouldShowContingencyPlanPartnersPages(this.application)) return 'contingency-plan-partners'
    if (shouldShowContingencyPlanQuestionsPage(this.application)) return 'contingency-plan-questions'

    return ''
  }

  response() {
    return {
      [this.questions.additionalCircumstances]: yesOrNoResponseWithDetailForYes<QuestionKeys>(
        'additionalCircumstances',
        this.body,
      ),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.additionalCircumstances) {
      errors.additionalCircumstances = `You must specify if ${this.application.person.name} there are any additional circumstances that have helped them ${this.questionPredicates.additionalCircumstances}`
    }

    if (this.body.additionalCircumstances === 'yes' && !this.body.additionalCircumstancesDetail) {
      errors.additionalCircumstancesDetail = 'You must specify details of the additional circumstances'
    }

    return errors
  }
}
