import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class EndDatesPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Which of the following dates are relevant?', application, 'basic-information', 'end-dates')
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('selectedDates', { addArrayNotationToInputName: true })
    this.completeDateInputsFromPageBody('paroleEligbilityDate')
    this.completeDateInputsFromPageBody('homeDetentionCurfewDate')
    this.completeDateInputsFromPageBody('licenceExpiryDate')
    this.completeDateInputsFromPageBody('pssStartDate')
    this.completeDateInputsFromPageBody('pssEndDate')
    this.completeDateInputsFromPageBody('sedDate')
  }
}
