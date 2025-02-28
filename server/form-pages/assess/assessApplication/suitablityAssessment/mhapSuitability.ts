import type { PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

export type MhapSuitabilityBody = {
  mhapIdentifiedAsSuitable: YesOrNo
  unsuitabilityForMhapRationale: string
  yesDetail?: string
  noDetail?: string
}

@Page({
  name: 'mhap-suitability',
  bodyProperties: ['mhapIdentifiedAsSuitable', 'unsuitabilityForMhapRationale', 'yesDetail', 'noDetail'],
})
export default class MhapSuitability implements TasklistPage {
  name = 'mhap-suitability' as const

  title = 'Suitability assessment'

  questions = {
    mhapIdentifiedAsSuitable:
      'Has a Specialist Mental Health Approved Premises (MHAP) been identified as a suitable placement?',
    unsuitabilityForMhapRationale:
      'If the person is unsuitable for an MHAP placement yet suitable for a standard placement, summarise the rationale for the decision',
    detail: 'Provide details to support the decision',
  }

  constructor(
    public body: MhapSuitabilityBody,
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

    if (this.body.mhapIdentifiedAsSuitable === 'yes') {
      response[this.questions.mhapIdentifiedAsSuitable] = `Yes - ${this.body.yesDetail}`
    }
    if (this.body.mhapIdentifiedAsSuitable === 'no') {
      response[this.questions.mhapIdentifiedAsSuitable] = `No - ${this.body.noDetail}`
    }

    response[this.questions.unsuitabilityForMhapRationale] = this.body.unsuitabilityForMhapRationale

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.mhapIdentifiedAsSuitable)
      errors.mhapIdentifiedAsSuitable =
        'You must confirm if a Specialist Mental Health Approved Premises (MHAP) been identified as a suitable placement'

    if (this.body.mhapIdentifiedAsSuitable === 'yes' && !this.body.yesDetail)
      errors.yesDetail = 'You must provide details to support the decision'

    if (this.body.mhapIdentifiedAsSuitable === 'no' && !this.body.noDetail)
      errors.noDetail = 'You must provide details to support the decision'

    if (this.body.mhapIdentifiedAsSuitable === 'no' && !this.body.unsuitabilityForMhapRationale)
      errors.unsuitabilityForMhapRationale =
        'You must summarise why the person is unsuitable for an MHAP placement yet suitable for a standard placement'

    return errors
  }
}
