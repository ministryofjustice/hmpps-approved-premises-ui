import { ApprovedPremisesApplication } from '../../../server/@types/shared/models/ApprovedPremisesApplication'
import ApplyPage from './applyPage'

export default class NationalSecurityDivision extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
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
