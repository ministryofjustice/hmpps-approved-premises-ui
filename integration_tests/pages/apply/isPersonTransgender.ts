import { Cas1Application as Application } from '../../../server/@types/shared'

import ApplyPage from './applyPage'

export default class IsPersonTrangender extends ApplyPage {
  constructor(application: Application) {
    super(
      `Is the person transgender or do they have a transgender history?`,
      application,
      'basic-information',
      'transgender',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('transgenderOrHasTransgenderHistory')
  }
}
