import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import RfapSuitability from './rfapSuitability'

export type EsapSuitabilityBody = {
  esapPlacementNeccessary: YesOrNo
  unsuitabilityForEsapRationale: string
  yesDetail?: string
  noDetail?: string
}

@Page({
  name: 'esap-suitability',
  bodyProperties: ['esapPlacementNeccessary', 'unsuitabilityForEsapRationale', 'yesDetail', 'noDetail'],
})
export default class EsapSuitability implements TasklistPage {
  title = 'Suitability assessment'

  questions = {
    esapPlacementNecessary:
      'Is an Enhanced Security Approved Premises (ESAP) placement necessary for the management of the individual referred?',
    unsuitabilityForEsapRationale:
      'If the person is unsuitable for a ESAP placement yet suitable for a standard placement, summarise the rationale for the decision',
    detail: 'Provide details to support the decision',
  }

  constructor(
    public body: EsapSuitabilityBody,
    private readonly assessment: Assessment,
  ) {}

  previous() {
    const needsRfap = retrieveOptionalQuestionResponseFromFormArtifact(
      this.assessment.application,
      RfapSuitability,
      'needARfap',
    )

    if (needsRfap === 'yes') {
      return 'rfap-suitability'
    }

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

    if (this.body.esapPlacementNeccessary === 'yes') {
      response[this.questions.esapPlacementNecessary] = `Yes - ${this.body.yesDetail}`
    }
    if (this.body.esapPlacementNeccessary === 'no') {
      response[this.questions.esapPlacementNecessary] = `No - ${this.body.noDetail}`
    }

    response[this.questions.unsuitabilityForEsapRationale] = this.body.unsuitabilityForEsapRationale

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (this.body.esapPlacementNeccessary === 'yes' && !this.body.yesDetail)
      errors.yesDetail = 'You must provide details to support the decision'

    if (this.body.esapPlacementNeccessary === 'no' && !this.body.noDetail)
      errors.noDetail = 'You must provide details to support the decision'

    if (!this.body.esapPlacementNeccessary)
      errors.esapPlacementNeccessary =
        'You must confirm if a Enhanced Security Approved Premises (ESAP) has been identified as a suitable placement'

    return errors
  }
}
