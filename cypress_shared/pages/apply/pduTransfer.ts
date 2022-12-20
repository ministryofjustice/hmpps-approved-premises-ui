import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PduTransferPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Have you agreed ${application.person.name}'s transfer/supervision with the receiving PDU?`,
      application,
      'location-factors',
      'pdu-transfer',
      paths.applications.pages.show({
        id: application.id,
        task: 'location-factors',
        page: 'describe-location-factors',
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('transferStatus')
    this.completeTextInputFromPageBody('probationPractitioner')
  }
}
