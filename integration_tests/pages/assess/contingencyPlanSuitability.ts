import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import ContingencyPlanSuitability from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/contingencyPlanSuitability'

export default class ContingencyPlanSuitabilityPage extends AssessPage {
  pageClass: ContingencyPlanSuitability

  constructor(assessment: Assessment) {
    super('Suitability assessment', assessment, 'suitability-assessment', 'contingency-plan-suitability')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('contingencyPlanSufficient')
    this.completeTextInputFromPageBody('additionalComments')
  }
}
