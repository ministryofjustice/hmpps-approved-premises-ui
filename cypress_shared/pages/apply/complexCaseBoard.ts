import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ComplexCaseBoardPage extends ApplyPage {
  constructor(application: Application) {
    super('Complex case board', application, 'further-considerations', 'complex-case-board')
    cy.get('.govuk-form-group').contains(
      `Does ${application.person.name}'s gender identity require a complex case board to review their application? `,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('complexCaseBoard')
    this.completeTextInputFromPageBody('complexCaseBoardDetail')
  }
}
