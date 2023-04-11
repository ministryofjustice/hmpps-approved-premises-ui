import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ComplexCaseBoardPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Complex case board',
      application,
      'further-considerations',
      'complex-case-board',
      paths.applications.pages.show({
        id: application.id,
        task: 'further-considerations',
        page: 'previous-placements',
      }),
    )
    cy.get('.govuk-form-group').contains(
      `Does ${application.person.name}'s gender identity require a complex case board to review their application? `,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('complexCaseBoard')
    this.completeTextInputFromPageBody('complexCaseBoardDetail')
  }
}
