import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RfapDetailsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Recovery Focused Approved Premises (RFAP)',
      application,
      'type-of-ap',
      'rfap-details',
      paths.applications.pages.show({ id: application.id, task: 'type-of-ap', page: 'ap-type' }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('motivation')
    this.completeTextInputFromPageBody('continuedRecovery')
    this.checkRadioButtonFromPageBody('receivingTreatment')
    this.completeTextInputFromPageBody('receivingTreatmentDetail')
  }
}
