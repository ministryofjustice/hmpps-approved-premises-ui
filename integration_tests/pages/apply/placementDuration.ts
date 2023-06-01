import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class PlacementDurationPage extends ApplyPage {
  application: ApprovedPremisesApplication

  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'placement-duration',
      paths.applications.show({ id: application.id }),
    )
    this.application = application
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('differentDuration')
    this.completeTextInputFromPageBody('duration')
    this.completeTextInputFromPageBody('reason')
  }
}
