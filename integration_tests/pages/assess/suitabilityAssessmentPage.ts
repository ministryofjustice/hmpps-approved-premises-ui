import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class SuitabilityAssessmentPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability assessment', assessment, 'suitability-assessment', 'suitability-assessment', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('riskFactors')
    this.completeTextInputFromPageBody('riskFactorsComments')
    this.checkRadioButtonFromPageBody('riskManagement')
    this.completeTextInputFromPageBody('riskManagementComments')
    this.checkRadioButtonFromPageBody('locationOfPlacement')
    this.completeTextInputFromPageBody('locationOfPlacementComments')
    this.checkRadioButtonFromPageBody('moveOnPlan')
    this.completeTextInputFromPageBody('moveOnPlanComments')
  }
}
