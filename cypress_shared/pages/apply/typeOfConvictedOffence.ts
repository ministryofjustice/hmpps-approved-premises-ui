import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class TypeOfConvictedOffence extends ApplyPage {
  constructor(application: Application) {
    super(
      `What type of offending has ${application.person.name} been convicted of?`,
      application,
      'risk-management-features',
      'type-of-convicted-offence',
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('offenceConvictions')
  }
}
