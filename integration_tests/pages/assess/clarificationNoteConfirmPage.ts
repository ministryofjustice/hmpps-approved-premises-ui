import { ApprovedPremisesApplication } from '@approved-premises/api'

import Page from '../page'

export default class SufficientInformationPage extends Page {
  constructor() {
    super('How to get further information')
  }

  clickBackToDashboard() {
    return cy.get('a').contains('Return to dashboard').click()
  }

  confirmUserDetails(application: ApprovedPremisesApplication) {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', application.data['basic-information']['confirm-your-details'].name)
      this.assertDefinition('Email', application.data['basic-information']['confirm-your-details'].emailAddress)
      this.assertDefinition('Contact number', application.data['basic-information']['confirm-your-details'].phoneNumber)
    })
  }
}
