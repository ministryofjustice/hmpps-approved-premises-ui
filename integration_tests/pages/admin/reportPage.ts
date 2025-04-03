import paths from '../../../server/paths/admin'
import { ReportType } from '../../../server/utils/reportUtils'
import Page from '../page'

export default class ReportPage extends Page {
  constructor() {
    super('Reports')
  }

  static visit(): ReportPage {
    cy.visit(paths.admin.reports.new({}))
    return new ReportPage()
  }

  selectDates(month: string, year: string): void {
    this.getSelectInputByIdAndSelectAnEntry('month', month)
    this.getSelectInputByIdAndSelectAnEntry('year', year)
  }

  downloadReport(month: string, year: string, reportName: ReportType): void {
    this.checkRadioByNameAndValue('reportType', reportName)
    this.selectDates(month, year)
    cy.get('button').contains('Download data').click()
  }

  shouldHaveDownloadedReport(month: string, year: string, reportName: ReportType): void {
    const reportFilename = `${reportName}-${year}-${month.padStart(2, '0')}.xlsx`
    return this.shouldHaveDownloadedFile(reportFilename)
  }

  shouldShowErrorMessages() {
    cy.get('.govuk-error-summary').should('contain', 'You must choose a month and year')
    cy.get(`[data-cy-error-date]`).should('contain', 'You must choose a month and year')
    cy.get('.govuk-error-summary').should('contain', 'You must choose a report type')
    cy.get(`[data-cy-error-reporttype]`).should('contain', 'You must choose a report type')
  }
}
