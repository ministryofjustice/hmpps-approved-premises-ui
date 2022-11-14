import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class TypeOfAccomodationPage extends ApplyPage {
  constructor(application: Application) {
    super('Placement duration and move on', application, 'move-on', 'type-of-accommodation')
    cy.get('.govuk-form-group').contains(
      `What type of accommodation will ${application.person.name} have when they leave the AP?`,
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('accommodationType')
  }
}
