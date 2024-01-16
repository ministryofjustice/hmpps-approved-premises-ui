import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class RfapSuitabilityPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability assessment', assessment, 'suitability-assessment', 'rfap-suitability')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('rfapIdentifiedAsSuitable')
    this.completeTextInputFromPageBody('noDetail')
    this.completeTextInputFromPageBody('unsuitabilityForRfapRationale')
  }
}
