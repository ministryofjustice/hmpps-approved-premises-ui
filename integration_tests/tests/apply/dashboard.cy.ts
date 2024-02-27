import { applicationSummaryFactory } from '../../../server/testutils/factories'
import { normaliseCrn } from '../../../server/utils/normaliseCrn'
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

  it('supports sorting by tier', () => {
    shouldSortByField('tier')
  })

  it('supports sorting by createdAt', () => {
    shouldSortByField('createdAt')
  })

  it('supports sorting by arrivalDate', () => {
    shouldSortByField('arrivalDate')
  })

  it('supports filtering', () => {
    // Given I am logged in
    cy.signIn()

    // And there is a page of applications
    const applications = applicationSummaryFactory.buildList(10)

    cy.task('stubAllApplications', { applications })
    cy.task('stubAllApplications', { applications: [applications[1]], searchOptions: { crnOrName: 'foo' } })
    cy.task('stubAllApplications', {
      applications: [applications[2], applications[3]],
      searchOptions: { status: 'submitted' },
    })

    // When I access the applications dashboard
    let page = DashboardPage.visit(applications)

    // Then I should see all of the applications
    page.shouldShowApplications()

    // When I search by CRN or Name
    page.searchByCrnOrName('foo')

    // Then the API should have received a request for the query
    cy.task('verifyDashboardRequest', { page: '1', searchOptions: { crnOrName: normaliseCrn('foo') } }).then(
      requests => {
        expect(requests).to.have.length.greaterThan(0)
      },
    )

    // And I should see the search results that match that query
    page = new DashboardPage([applications[1]])
    page.shouldShowApplications()

    // When I search by status
    page.searchByStatus('submitted')

    // Then the API should have received a request for the query
    cy.task('verifyDashboardRequest', { page: '1', searchOptions: { status: 'submitted' } }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // And I should see the search results that match that query
    page = new DashboardPage([applications[2], applications[3]])
    page.shouldShowApplications()
  })

  it('request for placement', () => {
    // Given I am logged in
    cy.signIn()

    // And there is a page of applications
    const applications = applicationSummaryFactory.buildList(10, { status: 'awaitingPlacement' })

    cy.task('stubAllApplications', { applications })

    // When I access the applications dashboard
    const page = DashboardPage.visit(applications)

    // Then I should see all of the applications
    page.shouldShowApplications()
  })

  const shouldSortByField = (field: string) => {
    // Given I am logged in
    cy.signIn()

    // And there is a page of applications
    const applications = applicationSummaryFactory.buildList(10)

    cy.task('stubAllApplications', { applications, page: '1' })
    cy.task('stubAllApplications', {
      applications,
      page: '1',
      sortBy: field,
      sortDirection: 'asc',
    })
    cy.task('stubAllApplications', {
      applications,
      page: '1',
      sortBy: field,
      sortDirection: 'desc',
    })

    // When I access the applications dashboard
    const page = DashboardPage.visit(applications)

    // Then I should see the first result
    page.shouldShowApplications()

    // When I sort by Tier
    page.clickSortBy(field)

    // Then the API should have received a request for the sort
    cy.task('verifyDashboardRequest', { page: '1', sortBy: field, sortDirection: 'asc' }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'ascending')

    // When I click the sort button again
    page.clickSortBy(field)

    // Then the API should have received a request for the sort
    cy.task('verifyDashboardRequest', { page: '1', sortBy: field, sortDirection: 'desc' }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'descending')
  }
})
