import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class PduTransferPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Have you agreed ${application.person.name}'s transfer/supervision with the receiving PDU?`,
      application,
      'location-factors',
      'pdu-transfer',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('transferStatus')
    this.completeTextInputFromPageBody('probationPractitioner')
  }
}
