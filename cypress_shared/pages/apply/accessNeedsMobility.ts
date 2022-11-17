import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class AccessNeedsMobilityPage extends ApplyPage {
  constructor(application: Application) {
    super('Access needs', application, 'access-and-healthcare', 'access-needs-mobility')
    cy.get('.govuk-form-group').contains(`Does ${application.person.name} require a wheelchair accessible room?`)
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('needsWheelchair')
    this.completeTextInputFromPageBody('mobilityNeeds')
    this.completeTextInputFromPageBody('visualImpairment')
  }
}
