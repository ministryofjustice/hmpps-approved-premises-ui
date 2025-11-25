import type { PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Cas1Assessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

export type PipeSuitabilityBody = {
  pipeIdentifiedAsSuitable: YesOrNo
  unsuitabilityForPipeRationale: string
  yesDetail?: string
  noDetail?: string
}

@Page({
  name: 'pipe-suitability',
  bodyProperties: ['pipeIdentifiedAsSuitable', 'unsuitabilityForPipeRationale', 'yesDetail', 'noDetail'],
})
export default class PipeSuitability implements TasklistPage {
  name = 'pipe-suitability' as const

  title = 'Suitability assessment'

  questions = {
    pipeIdentifiedAsSuitable:
      'Has Psychologically Informed Planned Environment (PIPE) been identified as a viable pathway?',
    unsuitabilityForPipeRationale:
      'If the person is unsuitable for a PIPE placement yet suitable for a standard placement, summarise the rationale for the decision.',
    detail: 'Provide details to support the decision',
  }

  constructor(
    public body: PipeSuitabilityBody,
    private readonly assessment: Assessment,
  ) {}

  previous() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name, { returnPreviousPage: true })
  }

  next() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name)
  }

  response() {
    const response: PageResponse = {}

    if (this.body.pipeIdentifiedAsSuitable === 'yes') {
      response[this.questions.pipeIdentifiedAsSuitable] = `Yes - ${this.body.yesDetail}`
    }
    if (this.body.pipeIdentifiedAsSuitable === 'no') {
      response[this.questions.pipeIdentifiedAsSuitable] = `No - ${this.body.noDetail}`
    }
    response[this.questions.unsuitabilityForPipeRationale] = this.body.unsuitabilityForPipeRationale

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.pipeIdentifiedAsSuitable)
      errors.pipeIdentifiedAsSuitable =
        'You must confirm if Psychologically Informed Planned Environment (PIPE) been identified as a viable pathway'

    if (this.body.pipeIdentifiedAsSuitable === 'yes' && !this.body.yesDetail)
      errors.yesDetail = 'You must provide details to support the decision'

    if (this.body.pipeIdentifiedAsSuitable === 'no' && !this.body.noDetail)
      errors.noDetail = 'You must provide details to support the decision'

    if (this.body.pipeIdentifiedAsSuitable === 'no' && !this.body.unsuitabilityForPipeRationale)
      errors.unsuitabilityForPipeRationale =
        'You must summarise why the person is unsuitable for a PIPE placement yet suitable for a standard placement'

    return errors
  }
}
