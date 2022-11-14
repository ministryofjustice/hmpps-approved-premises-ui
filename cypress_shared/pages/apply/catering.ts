import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class CateringPage extends ApplyPage {
  constructor(application: Application) {
    super('Catering requirements', application, 'further-considerations', 'catering')
    cy.get('.govuk-form-group').contains(
      `Do you have any concerns about ${application.person.name} catering for themselves?`,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('catering')
    this.completeTextInputFromPageBody('cateringDetail')
  }
}
