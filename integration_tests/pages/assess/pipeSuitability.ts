import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class PipeSuitabilityPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability assessment', assessment, 'suitability-assessment', 'pipe-suitability')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('pipeIdentifiedAsSuitable')
    this.completeTextInputFromPageBody('yesDetail')
    this.completeTextInputFromPageBody('unsuitabilityForPipeRationale')
  }
}
