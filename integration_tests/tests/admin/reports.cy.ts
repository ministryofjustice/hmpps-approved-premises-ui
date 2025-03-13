import { reportInputLabels, unusedReports } from '../../../server/utils/reportUtils'
import ReportPage from '../../pages/admin/reportPage'
import { signIn } from '../signIn'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am logged in as a report viewer
    signIn({ permissions: ['cas1_reports_view', 'cas1_reports_view_with_pii'] })
  })

  it('allows me to download reports', () => {
    Object.keys(reportInputLabels)
      .filter(reportName => {
        return !unusedReports.includes(reportName)
      })
      .forEach(reportName => {
        // Given there is a report available
        const month = '8'
        const year = '2023'
        cy.task('stubReport', { month, year, reportName })

        // When I visit the report page
        const page = ReportPage.visit()

        // And I download a lost beds report
        page.expectDownload()
        page.downloadReport('8', '2023', reportName)

        // Then the report should be downloaded
        page.shouldHaveDownloadedFile(month, year, reportName)
      })
  })

  it(`shows errors when I don't select a date or report type`, () => {
    // When I visit the report page
    const page = ReportPage.visit()

    // And I click submit
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowErrorMessages()
  })
})
