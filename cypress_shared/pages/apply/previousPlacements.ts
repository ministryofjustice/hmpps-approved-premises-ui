import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class PreviousPlacementsPage extends ApplyPage {
  constructor(application: Application) {
    super('Previous placements', application, 'further-considerations', 'previous-placements')
    cy.get('.govuk-form-group').contains(
      `Has ${application.person.name} stayed or been offered a placement in an AP before?`,
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('previousPlacement')
    this.completeTextInputFromPageBody('previousPlacementDetail')
  }
}
