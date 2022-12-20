import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class CateringPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Catering requirements',
      application,
      'further-considerations',
      'catering',
      paths.applications.pages.show({ id: application.id, task: 'further-considerations', page: 'complex-case-board' }),
    )
    cy.get('.govuk-form-group').contains(
      `Do you have any concerns about ${application.person.name} catering for themselves?`,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('catering')
    this.completeTextInputFromPageBody('cateringDetail')
  }
}
