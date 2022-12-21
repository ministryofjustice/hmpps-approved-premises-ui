import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class AccessNeedsMobilityPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Access, cultural and healthcare needs',
      application,
      'access-and-healthcare',
      'access-needs-mobility',
      paths.applications.pages.show({ id: application.id, task: 'access-and-healthcare', page: 'access-needs' }),
    )
    cy.get('.govuk-form-group').contains(`Does ${application.person.name} require a wheelchair accessible room?`)
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('needsWheelchair')
    this.completeTextInputFromPageBody('mobilityNeeds')
    this.completeTextInputFromPageBody('visualImpairment')
  }
}
