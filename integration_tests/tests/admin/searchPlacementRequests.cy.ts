import { PlacementRequestDashboardSearchOptions } from '@approved-premises/ui'
import { AvailableTierDto } from '@approved-premises/api'
import SearchPage from '../../pages/admin/placementApplications/searchPage'

import { cas1PlacementRequestSummaryFactory } from '../../../server/testutils/factories'
import { normaliseCrn } from '../../../server/utils/normaliseCrn'
import { signIn } from '../signIn'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Search placement Requests', () => {
  const placementRequests = cas1PlacementRequestSummaryFactory.buildList(3)
  const searchResults = cas1PlacementRequestSummaryFactory.buildList(2)

  const searchQuery = {
    crnOrName: 'CRN123',
    tierOnApplicationCreation: 'A3',
    arrivalDateStart: '2022-01-01',
    arrivalDateEnd: '2022-01-03',
    status: 'notMatched',
  } as PlacementRequestDashboardSearchOptions

  const tiers = ['A3', 'A2', 'A1', 'B3', 'B2', 'B1', 'D3', 'D2', 'D1'].map(tier => ({
    tier,
  })) as Array<AvailableTierDto>

  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')

    cy.task('stubPlacementRequestsSearch', { placementRequests })
    cy.task('stubPlacementRequestsSearch', {
      placementRequests: searchResults,
      ...searchQuery,
      crnOrName: normaliseCrn(searchQuery.crnOrName),
    })
    cy.task('stubTierReferenceData', { tiers })
  })

  it('allows me to search for placement requests', () => {
    WHEN('I visit the search page')
    const searchPage = SearchPage.visit()

    THEN('I should see a list of placement requests')
    searchPage.shouldShowPlacementRequests(placementRequests)

    WHEN('I search for a CRN')
    searchPage.enterSearchQuery(searchQuery)

    THEN('I should see the search results')
    searchPage.shouldShowPlacementRequests(searchResults)

    AND('the API should have received a request for the CRN')
    cy.task('verifyPlacementRequestsSearch', searchQuery).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      ...searchQuery,
      page: '2',
    })
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      ...searchQuery,
      page: '9',
    })

    WHEN('I visit the search page')
    const searchPage = SearchPage.visit()

    THEN('I should see a list of placement requests')
    searchPage.shouldShowPlacementRequests(placementRequests)

    AND('I search for a CRN')
    searchPage.enterSearchQuery(searchQuery)

    WHEN('I click next')
    searchPage.clickNext()

    THEN('the API should have received a request for the next page')
    cy.task('verifyPlacementRequestsSearch', { page: '2', ...searchQuery }).then(requests => {
      expect(requests).to.have.length(1)
    })

    WHEN('I click on a page number')
    searchPage.clickPageNumber('9')

    THEN('the API should have received a request for the that page number')
    cy.task('verifyPlacementRequestsSearch', { page: '9', ...searchQuery }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports sorting', () => {
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      sortBy: 'expected_arrival',
      sortDirection: 'asc',
    })
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      sortBy: 'expected_arrival',
      sortDirection: 'desc',
    })

    WHEN('I visit the search page')
    const searchPage = SearchPage.visit()

    THEN('I should see a list of placement requests')
    searchPage.shouldShowPlacementRequests(placementRequests)

    AND('I search for a CRN')
    searchPage.enterSearchQuery(searchQuery)

    WHEN('I sort by expected arrival in ascending order')
    searchPage.clickSortBy('expected_arrival')

    THEN('the dashboard should be sorted by expected arrival')
    searchPage.shouldBeSortedByField('expected_arrival', 'ascending')

    AND('the API should have received a request for the correct sort order')
    cy.task('verifyPlacementRequestsSearch', {
      ...searchQuery,
      sortBy: 'expected_arrival',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    WHEN('I sort by expected arrival in descending order')
    searchPage.clickSortBy('expected_arrival')

    THEN('the dashboard should be sorted by expected arrival in descending order')
    searchPage.shouldBeSortedByField('expected_arrival', 'descending')

    AND('the API should have received a request for the correct sort order')
    cy.task('verifyPlacementRequestsSearch', {
      ...searchQuery,
      sortBy: 'expected_arrival',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
})
