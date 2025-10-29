import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { ApprovedPremisesApplicationStatus as ApplicationStatus } from '../../../server/@types/shared'
import {
  applicationFactory,
  cas1ApplicationSummaryFactory,
  personFactory,
  placementApplicationFactory,
  requestForPlacementFactory,
  restrictedPersonFactory,
} from '../../../server/testutils/factories'
import { applicationSuitableStatuses } from '../../../server/utils/applications/utils'
import { normaliseCrn } from '../../../server/utils/normaliseCrn'
import DashboardPage from '../../pages/apply/dashboard'
import { signIn } from '../signIn'
import CheckSentenceTypePage from '../../pages/match/placementRequestForm/checkSentenceType'
import Page from '../../pages/page'
import { defaultUserId } from '../../mockApis/auth'
import applicationDocument from '../../fixtures/applicationDocument.json'
import { ShowPage } from '../../pages/apply'

context('All applications', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as an applicant')
    signIn('applicant')
  })

  it('lists all applications with pagination', () => {
    GIVEN('there are multiple pages of applications')
    const page1Applications = cas1ApplicationSummaryFactory.buildList(10)
    const page2Applications = cas1ApplicationSummaryFactory.buildList(10)
    const page3Applications = cas1ApplicationSummaryFactory.buildList(10)

    cy.task('stubAllApplications', { applications: page1Applications, page: '1' })
    cy.task('stubAllApplications', { applications: page2Applications, page: '2' })
    cy.task('stubAllApplications', { applications: page3Applications, page: '3' })

    WHEN('I access the applications dashboard')
    const page1 = DashboardPage.visit(page1Applications)

    THEN('I should see the first result')
    page1.shouldShowApplications()

    WHEN('I click to see the next page')
    page1.clickNext()
    const page2 = new DashboardPage(page2Applications)

    THEN('the API should have received a request for the next page')
    cy.task('verifyDashboardRequest', { page: '2' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    AND('I should see the next page of applications')
    page2.shouldShowApplications()

    WHEN('I click on a page number')
    page2.clickPageNumber('3')
    const page3 = new DashboardPage(page3Applications)

    THEN('the API should have received a request for the next page')
    cy.task('verifyDashboardRequest', { page: '3' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    THEN('I should see the applications for that page')
    page3.shouldShowApplications()
  })

  it('lists all applications for lao', () => {
    GIVEN('there is a page of application')
    const page1Applications = cas1ApplicationSummaryFactory.buildList(1)

    page1Applications[0].person = restrictedPersonFactory.build()

    cy.task('stubAllApplications', { applications: page1Applications, page: '1' })

    WHEN('I access the applications dashboard')
    const page1 = DashboardPage.visit(page1Applications)

    THEN('I should see the first result')
    page1.shouldShowApplications()
  })

  it('supports sorting by tier', () => {
    shouldSortByField('tier')
  })

  it('supports sorting by createdAt', () => {
    GIVEN('there is a page of applications')
    const applications = cas1ApplicationSummaryFactory.buildList(10)

    cy.task('stubAllApplications', { applications, page: '1' })
    cy.task('stubAllApplications', {
      applications,
      page: '1',
      sortBy: 'createdAt',
      sortDirection: 'asc',
    })

    WHEN('I access the applications dashboard')
    const page = DashboardPage.visit(applications)

    THEN('I should see the first result')
    page.shouldShowApplications()

    THEN('the API should have received a request for the sort')
    cy.task('verifyDashboardRequest', { page: '1', sortBy: 'createdAt', sortDirection: 'desc' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    WHEN('I sort by created at')
    page.clickSortBy('createdAt')

    THEN('the API should have received a request for the sort')
    cy.task('verifyDashboardRequest', { page: '1', sortBy: 'createdAt', sortDirection: 'desc' }).then(requests => {
      expect(requests).to.have.length(2)
    })

    AND('the page should show the sorted items')
    page.shouldBeSortedByField('createdAt', 'descending')

    WHEN('I click the sort button again')
    page.clickSortBy('createdAt')

    THEN('the API should have received a request for the sort')
    cy.task('verifyDashboardRequest', { page: '1', sortBy: 'createdAt', sortDirection: 'asc' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    AND('the page should show the sorted items')
    page.shouldBeSortedByField('createdAt', 'ascending')
  })

  it('supports sorting by arrivalDate', () => {
    shouldSortByField('arrivalDate')
  })

  it('supports filtering', () => {
    GIVEN('there is a page of applications')
    const applications = cas1ApplicationSummaryFactory.buildList(10)
    const statusFilter: ApplicationStatus = 'rejected'
    cy.task('stubAllApplications', { applications })
    cy.task('stubAllApplications', { applications: [applications[1]], searchOptions: { crnOrName: 'foo' } })
    cy.task('stubAllApplications', {
      applications: [applications[2], applications[3]],
      searchOptions: { status: statusFilter },
    })

    WHEN('I access the applications dashboard')
    let page = DashboardPage.visit(applications)

    THEN('I should see all of the applications')
    page.shouldShowApplications()

    WHEN('I search by CRN or Name')
    page.searchByCrnOrName('foo')

    THEN('the API should have received a request for the query')
    cy.task('verifyDashboardRequest', { page: '1', searchOptions: { crnOrName: normaliseCrn('foo') } }).then(
      requests => {
        expect(requests).to.have.length.greaterThan(0)
      },
    )

    AND('I should see the search results that match that query')
    page = new DashboardPage([applications[1]])
    page.shouldShowApplications()

    WHEN('I search by status')
    page.searchByStatus(statusFilter)

    THEN('the API should have received a request for the query')
    cy.task('verifyDashboardRequest', { page: '1', searchOptions: { status: statusFilter } }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    AND('I should see the search results that match that query')
    page = new DashboardPage([applications[2], applications[3]])
    page.shouldShowApplications()

    WHEN('I filter by application suitable')
    page.searchByStatus(applicationSuitableStatuses)

    THEN('the API should have received a request for the query')
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
      GIVEN('there is a page of applications')
      const applications = cas1ApplicationSummaryFactory.buildList(1, {
        status: 'awaitingPlacement',
        hasRequestsForPlacement: false,
      })
      const applicationId = applications[0].id
      cy.task('stubAllApplications', { applications })

      AND('there is a placement application in the DB')
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId,
      })
      const completedApplication = applicationFactory.completed('accepted').build({
        id: applicationId,
        createdByUserId: defaultUserId,
        person: personFactory.build(),
        document: applicationDocument,
      })

      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationGet', { application: completedApplication })

      WHEN('I access the applications dashboard')
      const page = DashboardPage.visit(applications)

      THEN('I should see all the applications')
      page.shouldShowApplications()

      AND('I should be able to click on request for placement')
      page.clickRequestForPlacementLink()

      AND('I should be on placement request')
      Page.verifyOnPage(CheckSentenceTypePage, placementApplicationId)
    })
  })

  it('navigate to request for placement tab for application with at least one request for placement', () => {
    Cypress.env({
      ONE_APPPLICATION: 'no',
    })

    GIVEN('there is a page of applications')
    const applications = cas1ApplicationSummaryFactory.buildList(1, {
      status: 'awaitingPlacement',
      hasRequestsForPlacement: true,
    })
    const application = applications[0]
    const applicationId = application.id

    cy.task('stubAllApplications', { applications: [application] })
    cy.task('stubApplicationGet', { application })

    AND('there is a request for placement in the DB')
    const requestsForPlacement = requestForPlacementFactory.buildList(1)
    cy.task('stubApplicationRequestsForPlacement', {
      applicationId,
      requestsForPlacement,
    })

    WHEN('I access the applications dashboard')
    const page = DashboardPage.visit([application])

    THEN('I should see all the applications')
    page.shouldShowApplications()

    AND('I should be able to click on request for placement')
    page.clickLink('View placement request(s)')

    AND('I should be on the application view page on the placement request tab')
    const showPage = Page.verifyOnPage(ShowPage, application)
    showPage.shouldContainPlacementRequestTab()

    WHEN('I click the back link')
    showPage.clickBack()

    THEN('I should be back on the dashboard page')
    page.checkOnPage()
  })

  const shouldSortByField = (field: string) => {
    GIVEN('there is a page of applications')
    const applications = cas1ApplicationSummaryFactory.buildList(10)

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

    WHEN('I access the applications dashboard')
    const page = DashboardPage.visit(applications)

    THEN('I should see the first result')
    page.shouldShowApplications()

    WHEN('I sort by Tier')
    page.clickSortBy(field)

    THEN('the API should have received a request for the sort')
    cy.task('verifyDashboardRequest', { page: '1', sortBy: field, sortDirection: 'asc' }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    AND('the page should show the sorted items')
    page.shouldBeSortedByField(field, 'ascending')

    WHEN('I click the sort button again')
    page.clickSortBy(field)

    THEN('the API should have received a request for the sort')
    cy.task('verifyDashboardRequest', { page: '1', sortBy: field, sortDirection: 'desc' }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    AND('the page should show the sorted items')
    page.shouldBeSortedByField(field, 'descending')
  }
})
