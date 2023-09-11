import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RelocationRegionPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'relocation-region',
      paths.applications.pages.show({ id: application.id, task: 'move-on', page: 'placement-duration' }),
    )
    cy.get('.govuk-form-group').contains(`Where is the person most likely to live when they move on from the AP?`)
  }

  completeForm() {
    this.completeTextInputFromPageBody('postcodeArea')
  }
}
