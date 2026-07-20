import { Cas1Application } from '@approved-premises/api'
import ApplyPage from './applyPage'

export default class NationalSecurityDivision extends ApplyPage {
  constructor(application: Cas1Application) {
    super(
      `Is the person managed by the National Security Division?`,
      application,
      'type-of-ap',
      'managed-by-national-security-division',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('managedByNationalSecurityDivision')
  }
}
