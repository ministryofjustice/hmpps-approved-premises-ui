import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RfapPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Recovery Focused Approved Premises (RFAP)',
      application,
      'further-considerations',
      'rfap',
      paths.applications.pages.show({
        id: application.id,
        task: 'further-considerations',
        page: 'previous-placements',
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('needARfap')
  }
}
