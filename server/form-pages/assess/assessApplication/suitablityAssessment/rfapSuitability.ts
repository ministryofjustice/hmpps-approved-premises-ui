import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

export type RfapSuitabilityBody = {
  rfapIdentifiedAsSuitable: YesOrNo
  unsuitabilityForRfapRationale: string
}

@Page({
  name: 'rfap-suitability',
  bodyProperties: ['rfapIdentifiedAsSuitable', 'unsuitabilityForRfapRationale'],
})
export default class RfapSuitability implements TasklistPage {
  title = 'Suitability assessment'

  questions = {
    rfapIdentifiedAsSuitable:
      'Has a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement?',
    unsuitabilityForRfapRationale:
      'If the person is unsuitable for a RFAP placement yet suitable for a standard placement, summarise the rationale for the decision',
  }

  constructor(
    public body: RfapSuitabilityBody,
    private readonly assessment: Assessment,
  ) {}

  previous() {
    return 'suitability-assessment'
  }

  next() {
    if (
      noticeTypeFromApplication(this.assessment.application) === 'short_notice' ||
      noticeTypeFromApplication(this.assessment.application) === 'emergency'
    ) {
      return 'application-timeliness'
    }

    return ''
  }

  response() {
    const response = {}

    response[this.questions.rfapIdentifiedAsSuitable] = this.body.rfapIdentifiedAsSuitable
    response[this.questions.unsuitabilityForRfapRationale] = this.body.unsuitabilityForRfapRationale

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.rfapIdentifiedAsSuitable)
      errors.rfapIdentifiedAsSuitable =
        'You must confirm if a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement'

    return errors
  }
}
