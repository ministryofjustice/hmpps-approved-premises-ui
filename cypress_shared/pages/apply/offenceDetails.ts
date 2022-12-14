import { ApprovedPremisesApplication, ArrayOfOASysOffenceDetailsQuestions } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class OffenceDetails extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly offenceDetailSummaries: ArrayOfOASysOffenceDetailsQuestions,
  ) {
    super('Edit risk information', application, 'oasys-import', 'offence-details')
  }

  completeForm() {
    this.offenceDetailSummaries.forEach(summary => {
      cy.get('.govuk-label').contains(summary.label)
      cy.get(`textarea[name="offenceDetailsAnswers[${summary.questionNumber}]"]`)
        .should('contain', summary.answer)
        .type(`. With an extra comment ${summary.questionNumber}`)
    })
  }
}
