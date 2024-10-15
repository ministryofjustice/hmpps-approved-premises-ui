import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class AccessNeedsAdditionalDetailsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Access, cultural and healthcare needs',
      application,
      'access-and-healthcare',
      'access-needs-additional-details',
      paths.applications.pages.show({ id: application.id, task: 'access-and-healthcare', page: 'pregnancy' }),
    )
    cy.get('.govuk-form-group').contains(
      /Specify any additional details and adjustments required for the person's (.*) needs \(optional\)/,
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('additionalAdjustments')
  }
}
