import type { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SentenceTypePage extends ApplyPage {
  constructor(application: Application) {
    super('Which of the following best describes the sentence type?', application, 'basic-information', 'sentence-type')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sentenceType')
  }
}
