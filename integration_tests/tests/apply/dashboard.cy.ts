import { applicationSummaryFactory } from '../../../server/testutils/factories'
import DashboardPage from '../../pages/apply/dashboard'

context('All applications', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('lists all applications with pagination', () => {
    // Given I am logged in
    cy.signIn()

    // Given there are multiple pages of applications
    const page1Applications = applicationSummaryFactory.buildList(10)
    const page2Applications = applicationSummaryFactory.buildList(10)
    const page3Applications = applicationSummaryFactory.buildList(10)

    cy.task('stubAllApplications', { applications: page1Applications, page: '1' })
    cy.task('stubAllApplications', { applications: page2Applications, page: '2' })
    cy.task('stubAllApplications', { applications: page3Applications, page: '3' })

    // When I access the applications dashboard
    const page1 = DashboardPage.visit(page1Applications)

    // Then I should see the first result
    page1.shouldShowApplications()

    // When I click to see the next page
    page1.clickNext()
    const page2 = new DashboardPage(page2Applications)

    // Then the API should have received a request for the next page
    cy.task('verifyDashboardRequest', { page: '2' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And I should see the next page of applications
    page2.shouldShowApplications()

    // When I click on a page number
    page2.clickPageNumber('3')
    const page3 = new DashboardPage(page3Applications)

    // Then the API should have received a request for the next page
    cy.task('verifyDashboardRequest', { page: '3' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // Then I should see the applications for that page
    page3.shouldShowApplications()
  })
})
