import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class MhapSuitabilityPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability assessment', assessment, 'suitability-assessment', 'mhap-suitability')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('mhapIdentifiedAsSuitable')
    this.completeTextInputFromPageBody('noDetail')
    this.completeTextInputFromPageBody('unsuitabilityForMhapRationale')
  }
}
