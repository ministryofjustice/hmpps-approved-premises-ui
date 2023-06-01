import { OASysQuestion } from '../../../server/@types/shared'
import { OasysSummariesSection } from '../../../server/@types/ui'
import { camelCase, sentenceCase } from '../../../server/utils/utils'
import Page from '../page'

export default class RiskInformationPage extends Page {
  constructor() {
    super('Review risk information')
  }

  showsRiskInformation(oasysSections: { [index: string]: OasysSummariesSection }) {
    Object.entries(oasysSections).forEach(([sectionName, sectionValue]) => {
      switch (sectionName) {
        case 'riskManagementPlan':
          this.shouldShowRiskManagementPlan(sectionValue)
          break
        case 'roshSummary':
          this.shouldShowRoshSummary(sectionValue)
          break
        case 'optionalOasysSections':
          break
        default:
          this.shouldShowOasysSummary(sectionName, sectionValue)
          break
      }
    })
  }

  private shouldShowOasysSummary(sectionName: string, sectionValue: OasysSummariesSection) {
    cy.get('a')
      .contains(`${sentenceCase(sectionName)}`)
      .click()

    sectionValue[`${camelCase(sectionName)}Summaries`].forEach(summary => {
      this.shouldShowRiskInformationSummaries(summary)
    })
  }

  private shouldShowRoshSummary(roshSummary: OasysSummariesSection) {
    cy.get('a').contains('RoSH summary').click()
    roshSummary.roshSummaries.forEach(summary => {
      this.shouldShowRiskInformationSummaries(summary)
    })
  }

  private shouldShowRiskManagementPlan(riskManagementPlan: OasysSummariesSection) {
    cy.get('a').contains('Risk management plan').click()
    riskManagementPlan.riskManagementSummaries.forEach(summary => {
      this.shouldShowRiskInformationSummaries(summary)
    })
  }

  private shouldShowRiskInformationSummaries(summary: OASysQuestion) {
    cy.get('h2').contains(`${summary.questionNumber}. ${summary.label}`)
  }

  clickBackToDashboard() {
    cy.contains('a', 'Back to dashboard').click()
  }
}
