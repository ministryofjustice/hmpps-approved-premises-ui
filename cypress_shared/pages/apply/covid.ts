import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class CovidPage extends ApplyPage {
  constructor(application: Application) {
    super('COVID information', application, 'access-and-healthcare', 'covid')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('fullyVaccinated')
    this.checkRadioButtonFromPageBody('highRisk')
    this.completeTextInputFromPageBody('additionalCovidInfo')
  }
}
