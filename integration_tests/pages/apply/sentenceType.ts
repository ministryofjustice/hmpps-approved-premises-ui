import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SentenceTypePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Which sentence type does the person have?', application, 'basic-information', 'sentence-type')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sentenceType')
  }
}
