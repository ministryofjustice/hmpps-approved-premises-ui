import ReportPage from '../../pages/admin/reportPage'

context('Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()
  })

  it('allows me to download a lost beds report', () => {
    // Given there is a report available
    const month = '8'
    const year = '2023'
    cy.task('stubLostBedsReport', { month, year })

    // When I visit the report page
    const page = ReportPage.visit()

    // And I download a lost beds report
    page.expectDownload()
    page.downloadLostBedsReport('8', '2023')

    // Then the report should be downloaded
    page.shouldHaveDownloadedFile(month, year)
  })

  it(`shows errors when I don't select a date`, () => {
    // When I visit the report page
    const page = ReportPage.visit()

    // And I click submit
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowErrorMessages()
  })
})
