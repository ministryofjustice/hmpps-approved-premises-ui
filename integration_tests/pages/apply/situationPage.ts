import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SituationPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Which of the following options best describes the situation?', application, 'basic-information', 'situation')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('situation')
  }
}
