import { Cas1Application as Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class CovidPage extends ApplyPage {
  constructor(application: Application) {
    super('COVID information', application, 'access-and-healthcare', 'covid')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('boosterEligibility')
    this.completeTextInputFromPageBody('boosterEligibilityDetail')
    this.checkRadioButtonFromPageBody('immunosuppressed')
  }
}
