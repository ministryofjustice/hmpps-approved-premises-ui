import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

export type ContingencyPlanSuitabilityBody = {
  contingencyPlanSufficient: YesOrNo
  additionalComments: string
}

@Page({
  name: 'contingency-plan-suitability',
  bodyProperties: ['contingencyPlanSufficient', 'additionalComments'],
})
export default class ContingencyPlanSuitability implements TasklistPage {
  name = 'contingency-plan-suitability' as const

  title = 'Suitability assessment'

  questions = {
    contingencyPlanSufficient:
      'Is the contingency plan sufficient to manage behaviour or a failure to return out of hours?',
    additionalComments: 'Additional comments',
  }

  constructor(
    public body: ContingencyPlanSuitabilityBody,
    private readonly assessment: Assessment,
  ) {}

  previous() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name, { returnPreviousPage: true })
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    response[this.questions.contingencyPlanSufficient] = sentenceCase(this.body.contingencyPlanSufficient)
    response[`${this.questions.contingencyPlanSufficient} Additional comments`] = this.body.additionalComments

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.contingencyPlanSufficient)
      errors.contingencyPlanSufficient =
        'You must confirm if the contingency plan is sufficient to manage behaviour or a failure to return out of hours'

    if (!this.body.additionalComments) errors.additionalComments = 'You must provide additional comments'

    return errors
  }
}
