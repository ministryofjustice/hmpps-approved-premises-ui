import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

export type RfapSuitabilityBody = {
  rfapIdentifiedAsSuitable: YesOrNo
  unsuitabilityForRfapRationale: string
  yesDetail?: string
  noDetail?: string
}

@Page({
  name: 'rfap-suitability',
  bodyProperties: ['rfapIdentifiedAsSuitable', 'unsuitabilityForRfapRationale', 'yesDetail', 'noDetail'],
})
export default class RfapSuitability implements TasklistPage {
  name = 'rfap-suitability' as const

  title = 'Suitability assessment'

  questions = {
    rfapIdentifiedAsSuitable:
      'Has a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement?',
    unsuitabilityForRfapRationale:
      'If the person is unsuitable for a RFAP placement yet suitable for a standard placement, summarise the rationale for the decision',
    detail: 'Provide details to support the decision',
  }

  constructor(
    public body: RfapSuitabilityBody,
    private readonly assessment: Assessment,
  ) {}

  previous() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name, { returnPreviousPage: true })
  }

  next() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name)
  }

  response() {
    const response = {}

    if (this.body.rfapIdentifiedAsSuitable === 'yes') {
      response[this.questions.rfapIdentifiedAsSuitable] = `Yes - ${this.body.yesDetail}`
    }
    if (this.body.rfapIdentifiedAsSuitable === 'no') {
      response[this.questions.rfapIdentifiedAsSuitable] = `No - ${this.body.noDetail}`
    }

    response[this.questions.unsuitabilityForRfapRationale] = this.body.unsuitabilityForRfapRationale

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (this.body.rfapIdentifiedAsSuitable === 'yes' && !this.body.yesDetail)
      errors.yesDetail = 'You must provide details to support the decision'

    if (this.body.rfapIdentifiedAsSuitable === 'no' && !this.body.noDetail)
      errors.noDetail = 'You must provide details to support the decision'

    if (!this.body.rfapIdentifiedAsSuitable)
      errors.rfapIdentifiedAsSuitable =
        'You must confirm if a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement'

    return errors
  }
}
