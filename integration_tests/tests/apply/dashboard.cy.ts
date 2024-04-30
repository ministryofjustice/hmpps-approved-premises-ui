import { ApprovedPremisesApplicationStatus as ApplicationStatus } from '../../../server/@types/shared'
import {
  applicationSummaryFactory,
  placementApplicationFactory,
  requestForPlacementFactory,
} from '../../../server/testutils/factories'
import { applicationSuitableStatuses } from '../../../server/utils/applications/utils'
import { normaliseCrn } from '../../../server/utils/normaliseCrn'
import DashboardPage from '../../pages/apply/dashboard'
import ReasonForPlacementPage from '../../pages/match/placementRequestForm/reasonForPlacement'

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
    const statusFilter: ApplicationStatus = 'rejected'
    cy.task('stubAllApplications', { applications })
    cy.task('stubAllApplications', { applications: [applications[1]], searchOptions: { crnOrName: 'foo' } })
    cy.task('stubAllApplications', {
      applications: [applications[2], applications[3]],
      searchOptions: { status: statusFilter },
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
    page.searchByStatus(statusFilter)

    // Then the API should have received a request for the query
    cy.task('verifyDashboardRequest', { page: '1', searchOptions: { status: statusFilter } }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // And I should see the search results that match that query
    page = new DashboardPage([applications[2], applications[3]])
    page.shouldShowApplications()

    // When I filter by application suitable
    page.searchByStatus(applicationSuitableStatuses)

    // then the API should have received a request for the query
    cy.task('verifyDashboardRequest', {
      page: '1',
      searchOptions: { status: applicationSuitableStatuses.toString() },
    }).then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].queryParams.status.values).to.have.length(1)
      expect(requests[0].queryParams.status.values[0]).to.eq(applicationSuitableStatuses.toString())
    })
  })

  it('request for placement for application status awaiting placement', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      // Given I am logged in
      cy.signIn()

      // And there is a page of applications
      const applications = applicationSummaryFactory.buildList(1, {
        status: 'awaitingPlacement',
        hasRequestsForPlacement: false,
      })
      const applicationId = applications[0].id
      cy.task('stubAllApplications', { applications })

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)

      // When I access the applications dashboard
      const page = DashboardPage.visit(applications)

      // Then I should see all the applications
      page.shouldShowApplications()

      // And I should be able to click on request for placement
      page.clickRequestForPlacementLink()

      // And I should be on placement request
      ReasonForPlacementPage.visit(placementApplicationId)
    })
  })

  it('navigate to request for placement tab for application with at least one request for placement', () => {
    // Given I am logged in
    cy.signIn()

    // And there is a page of applications
    const applications = applicationSummaryFactory.buildList(1, {
      status: 'awaitingPlacement',
      hasRequestsForPlacement: true,
    })
    const application = applications[0]
    const applicationId = application.id

    cy.task('stubAllApplications', { applications: [application] })
    cy.task('stubApplicationGet', { application })

    // And there is a request for placement in the DB
    const requestsForPlacement = requestForPlacementFactory.buildList(1)
    cy.task('stubApplicationRequestsForPlacement', {
      applicationId,
      requestsForPlacement,
    })

    // When I access the applications dashboard
    const page = DashboardPage.visit([application])

    // Then I should see all the applications
    page.shouldShowApplications()

    // And I should be able to click on request for placement
    page.clickViewPlacementRequestsLink()

    // And I should be on request for placement tab
    page.shouldContainRequestAPlacementTab()
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
