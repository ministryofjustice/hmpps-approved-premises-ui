import { faker } from '@faker-js/faker'
import { reportInputLabels, unusedReports } from '../../../server/utils/reportUtils'
import ReportPage from '../../pages/admin/reportPage'
import { signIn } from '../signIn'
import { DateFormats } from '../../../server/utils/dateUtils'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a report viewer
    signIn('report_viewer_with_pii')
  })

  Object.keys(reportInputLabels)
    .filter(reportName => {
      return !unusedReports.includes(reportName)
    })
    .forEach(reportName => {
      it(`allows me to download the ${reportName} reports`, () => {
        // Given there is a report available
        const startDateObj = faker.date.recent({ days: 300 })
        const endDateObj = faker.date.soon({ days: 364, refDate: startDateObj })
        const startDate = DateFormats.dateObjToIsoDate(startDateObj)
        const endDate = DateFormats.dateObjToIsoDate(endDateObj)
        cy.task('stubReport', { startDate, endDate, reportName })

        // When I visit the report page
        const page = ReportPage.visit()

        // And I click submit without selecting the required report details
        page.clickButton('Download data')

        // Then I should see error messages
        page.shouldShowErrorMessagesForFields(['reportType', 'startDate', 'endDate'], {
          reportType: 'You must choose a report type',
          startDate: 'Enter or select a start date',
          endDate: 'Enter or select an end date',
        })

        // When I select the correct report type and dates
        page.expectDownload()
        page.downloadReport(startDate, endDate, reportName)

        // Then the report should be downloaded
        page.shouldHaveDownloadedReport(startDate, endDate, reportName)

        // And there should be no error messages
        page.shouldNotShowErrors()
      })
    })
})
