import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ConvictedOffences extends ApplyPage {
  constructor(application: Application) {
    super(
      `Has ${application.person.name} ever been convicted of the following offences?`,
      application,
      'risk-management-features',
      'convicted-offences',
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('response')
  }
}
