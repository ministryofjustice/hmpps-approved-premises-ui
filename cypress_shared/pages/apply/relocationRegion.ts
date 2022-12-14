import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RelocationRegionPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Placement duration and move on', application, 'move-on', 'relocation-region')
    cy.get('.govuk-form-group').contains(
      `Where is ${application.person.name} most likely to live when they move on from the AP?`,
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('postcodeArea')
  }
}
