import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ArsonPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Arson', application, 'further-considerations', 'arson')
    cy.get('.govuk-form-group').contains(`Does ${application.person.name} need a specialist arson room?`)
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('arson')
    this.completeTextInputFromPageBody('arsonDetail')
  }
}
