import ListPage from '../../cypress_shared/pages/match/listPlacementRequestsPage'

import placementRequestFactory from '../../server/testutils/factories/placementRequest'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows a list of placementRequests', () => {
    // Given I am logged in
    cy.signIn()

    const placementRequests = placementRequestFactory.buildList(5)

    cy.task('stubPlacementRequests', placementRequests)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowPlacementRequests()
  })
})
