import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class EndDatesPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Which of the following dates are relevant?', application, 'basic-information', 'end-dates')
  }

  completeForm() {
    this.completeDateInputsFromPageBody('pssDate')
    this.completeDateInputsFromPageBody('ledDate')
    this.completeDateInputsFromPageBody('sedDate')
  }
}
