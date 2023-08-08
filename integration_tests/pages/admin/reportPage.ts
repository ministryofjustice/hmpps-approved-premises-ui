import paths from '../../../server/paths/admin'
import Page from '../page'

export default class ReportPage extends Page {
  constructor() {
    super('Reports')
  }

  static visit(): ReportPage {
    cy.visit(paths.admin.reports.new({}))
    return new ReportPage()
  }

  downloadLostBedsReport(month: string, year: string): void {
    this.getSelectInputByIdAndSelectAnEntry('month', month)
    this.getSelectInputByIdAndSelectAnEntry('year', year)
    cy.get('button').contains('Download lost beds data').click()
  }

  shouldHaveDownloadedFile(month: string, year: string): void {
    const downloadsFolder = Cypress.config('downloadsFolder')
    const downloadedFilename = `${downloadsFolder}/lost-beds-${year}-${month.padStart(2, '0')}.xlsx`
    cy.readFile(downloadedFilename, 'binary', { timeout: 300 })
  }

  shouldShowErrorMessages() {
    cy.get('.govuk-error-summary').should('contain', 'You must choose a month and year')
    cy.get(`[data-cy-error-date]`).should('contain', 'You must choose a month and year')
  }
}