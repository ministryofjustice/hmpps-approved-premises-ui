import { ApprovedPremisesApplication } from '../../../server/@types/shared/models/ApprovedPremisesApplication'
import ApplyPage from './applyPage'

export default class EsapExceptionalCase extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Has there been agreement with the Community Head of Public Protection that an application should be made as an exceptional case?',
      application,
      'type-of-ap',
      'esap-exceptional-case',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('agreedCaseWithCommunityHopp')
    if (this.tasklistPage.body.agreedCaseWithCommunityHopp === 'yes') {
      this.completeTextInputFromPageBody('communityHoppName')
      this.completeDateInputsFromPageBody('agreementDate')
      this.completeTextInputFromPageBody('agreementSummary')
    }
  }
}
