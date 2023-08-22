import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class TypeOfAccommodationPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'type-of-accommodation',
      paths.applications.pages.show({ id: application.id, task: 'move-on', page: 'plans-in-place' }),
    )
    cy.get('.govuk-form-group').contains(
      `What type of accommodation will ${nameOrPlaceholderCopy(application.person)} have when they leave the AP?`,
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('accommodationType')
  }
}
