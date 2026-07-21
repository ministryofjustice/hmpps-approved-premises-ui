import type { Cas1Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SituationPage extends ApplyPage {
  constructor(application: Cas1Application) {
    super('What is the reason for placing this person in an AP?', application, 'basic-information', 'situation')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('situation')
  }
}
