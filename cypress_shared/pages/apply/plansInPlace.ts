import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class PlansInPlacePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Placement duration and move on', application, 'move-on', 'plans-in-place')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('arePlansInPlace')
  }
}
