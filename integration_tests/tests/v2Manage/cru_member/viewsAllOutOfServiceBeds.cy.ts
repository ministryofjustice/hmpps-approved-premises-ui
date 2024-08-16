import { outOfServiceBedFactory } from '../../../../server/testutils/factories'
import DashboardPage from '../../../pages/dashboard'
import Page from '../../../pages/page'
import { OutOfServiceBedIndexPage } from '../../../pages/v2Manage/outOfServiceBeds'
import { signIn } from '../../signIn'

describe('CRU Member with permission to view out of service bed tile lists all OOS beds', () => {
  beforeEach(() => {
    cy.task('reset')
    // Given I am signed in as a CRU Member with the permission to view the out of service beds tile
    signIn(['cru_member'], ['cas1_view_out_of_service_beds'])
  })

  const outOfServiceBeds = outOfServiceBedFactory.buildList(10)

  it('allows me to view all out of service beds', () => {
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
    // Given I am on the dashboard
    const dashboardPage = DashboardPage.visit()

    // When I click the 'Out of service beds' tile
    dashboardPage.shouldShowCard('outOfServiceBeds')
    cy.get('a').contains('View out of service beds').click()

    // Then I should be taken to the out of service beds index page
    const page = Page.verifyOnPage(OutOfServiceBedIndexPage)

    // And I should see a list of currently out of service beds
    page.shouldShowOutOfServiceBeds(outOfServiceBeds)
  })

  it('supports pagination', () => {
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 2 })
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 9 })

    // When I visit the OOS beds index page
    const page = OutOfServiceBedIndexPage.visit('current')

    // And I click next
    page.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyOutOfServiceBedsDashboard', { page: 2, temporality: 'current' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I click on a page number
    page.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyOutOfServiceBedsDashboard', { page: 9, temporality: 'current' }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('allows me to filter by temporality', () => {
    const futureBeds = outOfServiceBedFactory.buildList(3)
    const historicBeds = outOfServiceBedFactory.buildList(3)

    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds,
      page: 1,
      temporality: 'current',
    })
    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds: futureBeds,
      page: 1,
      temporality: 'future',
    })
    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds: historicBeds,
      page: 1,
      temporality: 'past',
    })

    // Given I'm on the out of service beds index page
    const page = OutOfServiceBedIndexPage.visit('current')

    // When I click the 'future' tab
    page.clickTab('Future')

    // Then I see a list of future out of service beds
    page.shouldShowOutOfServiceBeds(futureBeds)

    // And when I click the 'historic' tab
    page.clickTab('Historic')

    // Then I see a list of historic out of service beds
    page.shouldShowOutOfServiceBeds(historicBeds)
  })

  it('supports sorting by premisesName', () => {
    shouldSortByField('premisesName')
  })

  it('supports sorting by roomName', () => {
    shouldSortByField('roomName')
  })

  it('supports sorting by bedName', () => {
    shouldSortByField('bedName')
  })

  it('supports sorting by startDate', () => {
    shouldSortByField('startDate')
  })

  it('supports sorting by endDate', () => {
    shouldSortByField('endDate')
  })

  it('supports sorting by reason', () => {
    shouldSortByField('reason')
  })

  it('supports sorting by daysLost', () => {
    shouldSortByField('daysLost')
  })
})

const shouldSortByField = (field: string) => {
  // And there is a page of out of service beds
  const outOfServiceBeds = outOfServiceBedFactory.buildList(5)

  cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
  cy.task('stubOutOfServiceBedsList', {
    outOfServiceBeds,
    page: 1,
    sortBy: field,
    sortDirection: 'asc',
    temporality: 'current',
  })
  cy.task('stubOutOfServiceBedsList', {
    outOfServiceBeds,
    page: 1,
    sortBy: field,
    sortDirection: 'desc',
    temporality: 'current',
  })

  // When I access the out of service beds dashboard
  const page = OutOfServiceBedIndexPage.visit('current')

  // Then I should see the first result
  page.shouldShowOutOfServiceBeds(outOfServiceBeds)

  // When I click the column to sort by
  page.clickSortBy(field)

  // Then the API should have received a request for the sort
  cy.task('verifyOutOfServiceBedsDashboard', {
    page: 1,
    sortBy: field,
    temporality: 'current',
  }).then(requests => {
    expect(requests).to.have.length(1)
  })

  // And the page should show the sorted items
  page.shouldBeSortedByField(field, 'ascending')

  // When I click the sort button again
  page.clickSortBy(field)

  // Then the API should have received a request for the sort
  cy.task('verifyOutOfServiceBedsDashboard', {
    page: 1,
    sortBy: field,
    sortDirection: 'desc',
    temporality: 'current',
  }).then(requests => {
    expect(requests).to.have.length(1)
  })

  // And the page should show the sorted items
  page.shouldBeSortedByField(field, 'descending')
}
