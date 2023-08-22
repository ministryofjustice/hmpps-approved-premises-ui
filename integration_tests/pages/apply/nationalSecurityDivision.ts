import { ApprovedPremisesApplication } from '../../../server/@types/shared/models/ApprovedPremisesApplication'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'
import ApplyPage from './applyPage'

export default class NationalSecurityDivision extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Is ${nameOrPlaceholderCopy(application.person)} managed by the National Security Division?`,
      application,
      'type-of-ap',
      'managed-by-national-security-division',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('managedByNationalSecurityDivision')
  }
}
