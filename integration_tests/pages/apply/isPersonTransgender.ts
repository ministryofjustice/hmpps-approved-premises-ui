import { ApprovedPremisesApplication } from '../../../server/@types/shared'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'
import ApplyPage from './applyPage'

export default class IsPersonTrangender extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Is ${nameOrPlaceholderCopy(application.person)} transgender or do they have a transgender history?`,
      application,
      'basic-information',
      'transgender',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('transgenderOrHasTransgenderHistory')
  }
}
