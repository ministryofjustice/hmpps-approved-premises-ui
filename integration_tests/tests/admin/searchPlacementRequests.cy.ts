import SearchPage from '../../pages/admin/placementApplications/searchPage'

import { placementRequestFactory } from '../../../server/testutils/factories'

context('Search placement Requests', () => {
  const placementRequests = placementRequestFactory.buildList(3)
  const searchResults = placementRequestFactory.buildList(2)

  const crn = 'CRN123'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    cy.task('stubPlacementRequestsSearch', { placementRequests })
    cy.task('stubPlacementRequestsSearch', { placementRequests: searchResults, crn })
  })

  it('allows me to search for placement requests', () => {
    // When I visit the search page
    const searchPage = SearchPage.visit()

    // Then I should see a list of placement requests
    searchPage.shouldShowPlacementRequests(placementRequests)

    // When I search for a CRN
    searchPage.searchForCrn('CRN123')

    // Then I should see the search results
    searchPage.shouldShowPlacementRequests(searchResults)

    // And the API should have received a request for the CRN
    cy.task('verifyPlacementRequestsSearch', { crn: 'CRN123' }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      status: 'notMatched',
      page: '2',
    })
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      status: 'notMatched',
      page: '9',
    })

    // When I visit the search page
    const searchPage = SearchPage.visit()

    // Then I should see a list of placement requests
    searchPage.shouldShowPlacementRequests(placementRequests)

    // And I search for a CRN
    searchPage.searchForCrn('CRN123')

    // When I click next
    searchPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyPlacementRequestsSearch', { page: '2', crn: 'CRN123' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I click on a page number
    searchPage.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyPlacementRequestsSearch', { page: '9', crn: 'CRN123' }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports sorting', () => {
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      sortBy: 'expectedArrival',
      sortDirection: 'asc',
    })
    cy.task('stubPlacementRequestsSearch', {
      placementRequests,
      crn: 'CRN123',
      sortBy: 'expectedArrival',
      sortDirection: 'desc',
    })

    // When I visit the search page
    const searchPage = SearchPage.visit()

    // Then I should see a list of placement requests
    searchPage.shouldShowPlacementRequests(placementRequests)

    // And I search for a CRN
    searchPage.searchForCrn('CRN123')

    // When I sort by expected arrival in ascending order
    searchPage.clickSortBy('expectedArrival')

    // Then the dashboard should be sorted by expected arrival
    searchPage.shouldBeSortedByField('expectedArrival', 'ascending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyPlacementRequestsSearch', {
      crn: 'CRN123',
      sortBy: 'expectedArrival',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I sort by expected arrival in descending order
    searchPage.clickSortBy('expectedArrival')

    // Then the dashboard should be sorted by expected arrival in descending order
    searchPage.shouldBeSortedByField('expectedArrival', 'descending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyPlacementRequestsSearch', {
      crn: 'CRN123',
      sortBy: 'expectedArrival',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
})
