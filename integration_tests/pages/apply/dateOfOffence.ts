import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class DateOfOffence extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Convicted offences', application, 'risk-management-features', 'date-of-offence')
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('arsonOffence')
    this.checkCheckboxesFromPageBody('hateCrime')
    this.checkCheckboxesFromPageBody('offencesAgainstChildren')
    this.checkCheckboxesFromPageBody('contactSexualOffencesAgainstAdults')
    this.checkCheckboxesFromPageBody('nonContactSexualOffencesAgainstAdults')
    this.checkCheckboxesFromPageBody('contactSexualOffencesAgainstChildren')
    this.checkCheckboxesFromPageBody('nonContactSexualOffencesAgainstChildren')
    this.checkCheckboxesFromPageBody('otherSexualOffences')
  }
}
