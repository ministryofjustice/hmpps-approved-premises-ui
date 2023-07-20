import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'

import {
  placementRequestDetailFactory,
  placementRequestFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import CreatePlacementPage from '../../pages/admin/placementApplications/createPlacementPage'

context('Placement Requests', () => {
  const placementRequests = placementRequestFactory.buildList(2)
  const placementRequestWithoutBooking = placementRequestDetailFactory.build({
    ...placementRequests[0],
    booking: undefined,
  })
  const placementRequestWithBooking = placementRequestDetailFactory.build({ ...placementRequests[1] })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    cy.task('stubPlacementRequestsDashboard', placementRequests)
    cy.task('stubPlacementRequest', placementRequestWithoutBooking)
    cy.task('stubPlacementRequest', placementRequestWithBooking)
  })

  it('allows me to view a placement request', () => {
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

  it('allows me to create a booking', () => {
    const premises = premisesFactory.buildList(3)
    cy.task('stubPremises', premises)
    cy.task('stubBookingFromPlacementRequest', placementRequestWithoutBooking)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(placementRequests)

    // And I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithoutBooking)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, placementRequestWithoutBooking)

    // When I click on the create booking button
    showPage.clickCreateBooking()

    // Then I should be on the create a booking page
    const createPage = Page.verifyOnPage(CreatePlacementPage, placementRequestWithoutBooking)

    // And the dates should be prepopulated
    createPage.dateInputsShouldBePrepopulated()

    // When I complete the form
    createPage.completeForm('2022-01-01', '2022-02-01', premises[0].id)
    createPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Placement created')

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', placementRequestWithoutBooking).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain({
        premisesId: premises[0].id,
        arrivalDate: '2022-01-01',
        departureDate: '2022-02-01',
      })
    })
  })
})
