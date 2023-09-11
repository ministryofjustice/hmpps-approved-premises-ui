import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class AdditionalCircumstancesPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Additional circumstances',
      application,
      'further-considerations',
      'additional-circumstances',
      paths.applications.pages.show({ id: application.id, task: 'further-considerations', page: 'arson' }),
    )
    cy.get('.govuk-form-group').contains(
      `Are there are any additional circumstances that have helped the person do well in the past?`,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('additionalCircumstances')
    this.completeTextInputFromPageBody('additionalCircumstancesDetail')
  }
}
