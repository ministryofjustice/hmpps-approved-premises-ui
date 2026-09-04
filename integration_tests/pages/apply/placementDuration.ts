import { Cas1Application as Application } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class PlacementDurationPage extends ApplyPage {
  application: Application

  constructor(application: Application) {
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
    this.completeTextInputFromPageBody('durationDays')
    this.completeTextInputFromPageBody('durationWeeks')
    this.completeTextInputFromPageBody('reason')
  }
}
