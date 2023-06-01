import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import SuitabilityAssessment from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/suitabilityAssessment'

export default class SuitabilityAssessmentPage extends AssessPage {
  pageClass = new SuitabilityAssessment({
    riskFactors: 'yes',
    riskFactorsComments: '',
    riskManagement: 'no',
    riskManagementComments: '',
    locationOfPlacement: 'no',
    locationOfPlacementComments: '',
    moveOnPlan: 'yes',
    moveOnPlanComments: '',
  })

  constructor(assessment: Assessment) {
    super(assessment, 'Suitability assessment')
  }

  completeForm() {
    this.checkRadioByNameAndValue('riskFactors', this.pageClass.body.riskFactors)
    this.completeTextArea('riskFactorsComments', 'One')
    this.checkRadioByNameAndValue('riskManagement', this.pageClass.body.riskManagement)
    this.completeTextArea('riskManagementComments', 'Two')
    this.checkRadioByNameAndValue('locationOfPlacement', this.pageClass.body.locationOfPlacement)
    this.completeTextArea('locationOfPlacementComments', 'Three')
    this.checkRadioByNameAndValue('moveOnPlan', this.pageClass.body.moveOnPlan)
    this.completeTextArea('moveOnPlanComments', 'Four')
  }
}
