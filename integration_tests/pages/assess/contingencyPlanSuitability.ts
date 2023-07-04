import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { YesOrNo } from '@approved-premises/ui'

import AssessPage from './assessPage'

import ContingencyPlanSuitability from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/contingencyPlanSuitability'

export default class ContingencyPlanSuitabilityPage extends AssessPage {
  pageClass: ContingencyPlanSuitability

  constructor(assessment: Assessment, sufficientAnswer: YesOrNo = 'no', detailAnswer = 'Some detail') {
    super(assessment, 'Suitability assessment')
    this.pageClass = new ContingencyPlanSuitability(
      { contingencyPlanSufficient: sufficientAnswer, additionalComments: detailAnswer },
      assessment,
    )
  }

  completeForm() {
    this.checkRadioByNameAndValue('contingencyPlanSufficient', this.pageClass.body.contingencyPlanSufficient)
    this.clearAndCompleteTextInputById('additionalComments', this.pageClass.body.additionalComments)
  }
}
