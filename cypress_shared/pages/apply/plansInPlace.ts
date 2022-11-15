import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class PlansInPlacePage extends ApplyPage {
  constructor(application: Application) {
    super('Placement duration and move on', application, 'move-on', 'plans-in-place')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('arePlansInPlace')
  }
}
