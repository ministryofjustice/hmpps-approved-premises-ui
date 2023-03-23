import ListPage from '../../cypress_shared/pages/match/listPlacementRequestsPage'
import SearchPage from '../../cypress_shared/pages/match/searchPage'

import placementRequestFactory from '../../server/testutils/factories/placementRequest'
import bedSearchResultFactory from '../../server/testutils/factories/bedSearchResult'

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
    const placementRequests = placementRequestFactory.buildList(5)
    cy.task('stubPlacementRequests', placementRequests)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowPlacementRequests()

    // And I should be able to click 'Find bed' on a placement request
    listPage.clickFindBed(placementRequests[0])

    SearchPage.visit()
  })
})
