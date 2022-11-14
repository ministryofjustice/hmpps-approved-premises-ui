import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class DateOfOffence extends ApplyPage {
  constructor(application: Application) {
    super('Convicted offences', application, 'risk-management-features', 'date-of-offence')
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('arsonOffence')
    this.checkCheckboxesFromPageBody('hateCrime')
    this.checkCheckboxesFromPageBody('inPersonSexualOffence')
  }
}
