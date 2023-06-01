import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ForeignNationalPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'foreign-national',
      paths.applications.pages.show({ id: application.id, task: 'move-on', page: 'type-of-accommodation' }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('response')
    this.completeDateInputsFromPageBody('date')
  }
}
