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

  downloadReport(startDate: string, endDate: string, reportName: ReportType): void {
    this.checkRadioByNameAndValue('reportType', reportName)
    this.completeDatePicker('startDate', startDate)
    this.completeDatePicker('endDate', endDate)
    this.clickButton('Download data')
  }

  shouldHaveDownloadedReport(startDate: string, endDate: string, reportName: ReportType): void {
    const reportFilename = `${reportName}-${startDate}-to-${endDate}-20250611_1602.xlsx`
    return this.shouldHaveDownloadedFile(reportFilename)
  }
}
