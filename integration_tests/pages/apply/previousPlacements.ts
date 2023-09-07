import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PreviousPlacementsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Previous Approved Premises (AP) placements',
      application,
      'further-considerations',
      'previous-placements',
      paths.applications.pages.show({
        id: application.id,
        task: 'further-considerations',
        page: 'vulnerability',
      }),
    )
    cy.get('.govuk-form-group').contains(`Has the person stayed or been offered a placement in an AP before?`)
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('previousPlacement')
    this.completeTextInputFromPageBody('previousPlacementDetail')
  }
}
