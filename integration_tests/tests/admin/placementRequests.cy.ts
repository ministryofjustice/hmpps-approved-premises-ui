import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'

import { placementRequestDetailFactory, placementRequestFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('allows me to view a placement request', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const placementRequests = placementRequestFactory.buildList(2)
    const placementRequestWithoutBooking = placementRequestDetailFactory.build({
      ...placementRequests[0],
      booking: undefined,
    })
    const placementRequestWithBooking = placementRequestDetailFactory.build({ ...placementRequests[1] })

    cy.task('stubPlacementRequestsDashboard', placementRequests)
    cy.task('stubPlacementRequest', placementRequestWithoutBooking)
    cy.task('stubPlacementRequest', placementRequestWithBooking)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests()

    // When I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithoutBooking)

    // Then I should be taken to the placement request page
    let showPage = Page.verifyOnPage(ShowPage, placementRequestWithoutBooking)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()
    showPage.shouldShowMatchingInformationSummary()

    // And I should not see any booking information
    showPage.shouldNotShowBookingInformation()

    showPage.shouldShowCreateBookingOption()
    showPage.shouldNotShowAmendBookingOption()
    showPage.shouldNotShowCancelBookingOption()

    // When I go back to the dashboard
    ListPage.visit(placementRequests)

    // And I click the placement request with a booking
    listPage.clickPlacementRequest(placementRequestWithBooking)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, placementRequestWithBooking)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()
    showPage.shouldShowMatchingInformationSummary()

    showPage.shouldNotShowCreateBookingOption()
    showPage.shouldShowAmendBookingOption()
    showPage.shouldShowCancelBookingOption()

    // And I should not see any booking information
    showPage.shouldShowBookingInformation()
  })
})
