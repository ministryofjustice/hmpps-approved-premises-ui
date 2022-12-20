import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PlansInPlacePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'plans-in-place',
      paths.applications.pages.show({ id: application.id, task: 'move-on', page: 'relocation-region' }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('arePlansInPlace')
  }
}
