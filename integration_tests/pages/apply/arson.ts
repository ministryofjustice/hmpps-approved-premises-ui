import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ArsonPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Arson',
      application,
      'further-considerations',
      'arson',
      paths.applications.pages.show({ id: application.id, task: 'further-considerations', page: 'catering' }),
    )
    cy.get('.govuk-form-group').contains(`Does the person pose an arson risk?`)
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('arson')
    this.completeTextInputFromPageBody('arsonDetail')
  }
}
