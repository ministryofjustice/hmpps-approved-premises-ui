import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import InformationReceived from '../../../server/form-pages/assess/reviewApplication/sufficientInformation/informationReceived'

export default class InformationReceivedPage extends AssessPage {
  constructor(private readonly assessment: Assessment) {
    super('Additional information', assessment, 'sufficient-information', 'information-received')
  }

  shouldShowQuery() {
    cy.get('span.govuk-details__summary-text').contains('View requested information').click()
    const { query } = this.assessment.data['sufficient-information']['sufficient-information']
    cy.get('.govuk-details__text').contains(query).should('be.visible')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('informationReceived')
    if (this.tasklistPage.body.informationReceived === 'yes') {
      this.clearAndCompleteTextInputById('response', (this.tasklistPage as InformationReceived).body.response)
      this.clearDateInputs('responseReceivedOn')
      this.completeDateInputsFromPageBody('responseReceivedOn')
    }
  }

  addNote() {
    this.completeTextInputFromPageBody('query')
  }
}
