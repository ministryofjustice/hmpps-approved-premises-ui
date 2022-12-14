import { Application, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RoshSummary extends ApplyPage {
  constructor(application: Application, private readonly roshSummary: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions) {
    super('Edit risk information', application, 'oasys-import', 'rosh-summary')
  }

  completeForm() {
    this.roshSummary.forEach(summary => {
      cy.get('.govuk-label').contains(summary.label)
      cy.get(`textarea[name="roshAnswers[${summary.questionNumber}]"]`)
        .should('contain', summary.answer)
        .type(`. With an extra comment ${summary.questionNumber}`)
    })
  }
}
