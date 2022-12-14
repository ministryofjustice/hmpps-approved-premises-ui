import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class AccessNeedsAdditionalAdjustmentsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Access needs', application, 'access-and-healthcare', 'access-needs-additional-adjustments')
    cy.get('legend').contains(
      /Does the placement require adjustments for the mobility, learning disability and neurodivergent conditions needs you selected?/,
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('adjustments')
    this.completeTextInputFromPageBody('adjustmentsDetail')
  }
}
