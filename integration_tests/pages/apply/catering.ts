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
      paths.applications.pages.show({
        id: application.id,
        task: 'further-considerations',
        page: 'previous-placements',
      }),
    )
    cy.get('.govuk-form-group').contains(`Can the person be placed in a self-catered Approved Premises (AP)?`)
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('catering')
    this.completeTextInputFromPageBody('cateringDetail')
  }
}
