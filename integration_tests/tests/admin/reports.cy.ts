import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
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

  it('allows me to download reports', () => {
    Object.keys(reportInputLabels)
      .filter(reportName => {
        return !unusedReports.includes(reportName)
      })
      .forEach(reportName => {
        // Given there is a report available
        const startDateObj = faker.date.recent({ days: 300 })
        const endDateObj = faker.date.soon({ days: 364, refDate: startDateObj })
        const startDate = DateFormats.dateObjToIsoDate(startDateObj)
        const endDate = DateFormats.dateObjToIsoDate(endDateObj)
        cy.task('stubReport', { startDate, endDate, reportName })

        // When I visit the report page
        const page = ReportPage.visit()

        // And I download a lost beds report
        page.expectDownload()
        page.downloadReport(startDate, endDate, reportName)

        // Then the report should be downloaded
        page.shouldHaveDownloadedReport(startDate, endDate, reportName)
      })
  })

  it(`shows errors when I don't enter a start or end date or a report type`, () => {
    // When I visit the report page
    const page = ReportPage.visit()

    // And I click submit
    page.clickSubmit()

    // Then I should see error messages
    page.shouldShowErrorMessagesForFields(['reportType', 'startDate', 'endDate'], {
      reportType: 'You must choose a report type',
      startDate: 'Enter or select a start date',
      endDate: 'Enter or select an end date',
    })
  })

  it('shows errors if the start and end date are more than a year apart', () => {
    const startDateObj = faker.date.recent({ days: 300 })
    const endDateObj = addDays(startDateObj, 365)
    const startDate = DateFormats.dateObjToIsoDate(startDateObj)
    const endDate = DateFormats.dateObjToIsoDate(endDateObj)

    // When I visit the report page
    const page = ReportPage.visit()

    // And I download a lost beds report
    page.downloadReport(startDate, endDate, 'out-of-service-beds')

    // And I click submit
    page.clickSubmit()

    // Then I should see an error
    page.shouldShowErrorMessagesForFields(['endDate'], {
      endDate: 'The date range must be a year or less',
    })
  })
})
