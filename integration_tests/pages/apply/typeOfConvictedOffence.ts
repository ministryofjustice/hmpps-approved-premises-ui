import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class TypeOfConvictedOffence extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `What type of offending has the person been convicted of?`,
      application,
      'risk-management-features',
      'type-of-convicted-offence',
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('offenceConvictions')
  }
}
