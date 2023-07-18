import ListPage from '../../pages/admin/placementApplications/listPage'

import { placementRequestFactory } from '../../../server/testutils/factories'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('shows a list of placement requests', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const placementRequests = placementRequestFactory.buildList(2)

    cy.task('stubPlacementRequestsDashboard', placementRequests)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests()
  })
})
