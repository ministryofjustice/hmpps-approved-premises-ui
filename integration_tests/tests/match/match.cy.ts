import ListPage from '../../../cypress_shared/pages/match/listPlacementRequestsPage'
import SearchPage from '../../../cypress_shared/pages/match/searchPage'

import { bedSearchResultFactory, personFactory, placementRequestFactory } from '../../../server/testutils/factories'
import Page from '../../../cypress_shared/pages/page'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows a list of placementRequests', () => {
    // Given I am logged in
    cy.signIn()

    // And there are beds and placement requests in the database
    const bedSearchResults = bedSearchResultFactory.build()
    cy.task('stubBedSearch', { bedSearchResults })
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })
    const placementRequests = placementRequestFactory.buildList(1, { person })
    cy.task('stubPlacementRequests', placementRequests)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowPlacementRequests()

    // When I click on a placement request
    listPage.clickFindBed(placementRequests[0])

    // Then I should be taken to the search page
    const searchPage = Page.verifyOnPage(SearchPage)

    // And I should see the search results
    searchPage.shouldDisplaySearchResults(bedSearchResults)
  })
})
