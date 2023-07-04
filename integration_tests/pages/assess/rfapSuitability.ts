import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { YesOrNo } from '@approved-premises/ui'

import AssessPage from './assessPage'

import RfapSuitability from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/rfapSuitability'

export default class RfapSuitabilityPage extends AssessPage {
  pageClass: RfapSuitability

  constructor(assessment: Assessment, suitableAnswer: YesOrNo = 'no', detailAnswer = 'Some detail') {
    super(assessment, 'Suitability assessment')
    this.pageClass = new RfapSuitability(
      { rfapIdentifiedAsSuitable: suitableAnswer, unsuitabilityForRfapRationale: detailAnswer },
      assessment,
    )
  }

  completeForm() {
    this.checkRadioByNameAndValue('rfapIdentifiedAsSuitable', this.pageClass.body.rfapIdentifiedAsSuitable)
    this.clearAndCompleteTextInputById('unsuitabilityForRfapRationale', this.pageClass.body.rfapIdentifiedAsSuitable)
  }
}
