import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ForeignNationalPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Placement duration and move on', application, 'move-on', 'foreign-national')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('response')
    this.completeDateInputsFromPageBody('date')
  }
}
