import { ApprovedPremisesApplication } from '../../../server/@types/shared'
import ApplyPage from './applyPage'

export default class IsPersonTrangender extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Is ${application.person.name} transgender or do they have a transgender history?`,
      application,
      'basic-information',
      'transgender',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('transgenderOrHasTransgenderHistory')
  }
}
