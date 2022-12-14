import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class PlacementPurposePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'What is the purpose of the Approved Premises (AP) placement?',
      application,
      'basic-information',
      'placement-purpose',
    )
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('placementPurposes')
    this.completeTextInputFromPageBody('otherReason')
  }
}
