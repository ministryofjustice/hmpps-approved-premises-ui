import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'

import {
  applicationFactory,
  cancellationFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import CreatePlacementPage from '../../pages/admin/placementApplications/createPlacementPage'
import { CancellationCreatePage, NewDateChangePage } from '../../pages/manage'
import { addResponseToFormArtifact } from '../../../server/testutils/addToApplication'
import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import WithdrawConfirmPage from '../../pages/manage/withdrawConfirm'

context('Placement Requests', () => {
  const placementRequests = placementRequestFactory.buildList(2)
  const parolePlacementRequests = placementRequestFactory.buildList(2, { isParole: true })
  const placementRequestWithoutBooking = placementRequestDetailFactory.build({
    ...placementRequests[0],
    booking: undefined,
  })
  const placementRequestWithBooking = placementRequestDetailFactory.build({ ...placementRequests[1] })
  const parolePlacementRequest = placementRequestDetailFactory.build({ ...parolePlacementRequests[0] })
  const preferredAps = premisesFactory.buildList(3)
  let application = applicationFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    application = addResponseToFormArtifact(application, {
      section: 'location-factors',
      page: 'preferred-aps',
      key: 'selectedAps',
      value: preferredAps,
    }) as Application

    placementRequestWithoutBooking.application = application

    cy.task('stubPlacementRequestsDashboard', { placementRequests, isParole: false })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: parolePlacementRequests, isParole: true })
    cy.task('stubPlacementRequest', placementRequestWithoutBooking)
    cy.task('stubPlacementRequest', placementRequestWithBooking)
    cy.task('stubPlacementRequest', parolePlacementRequest)
  })

  it('allows me to view a placement request', () => {
    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests(placementRequests)

    // When I click the parole link
    listPage.clickParoleOption()

    // Then I should see the parole requests listed
    listPage.shouldShowPlacementRequests(parolePlacementRequests)

    // When I click the non-parole link
    listPage.clickNonParoleOption()

    // And I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithoutBooking)

    // Then I should be taken to the placement request page
    let showPage = Page.verifyOnPage(ShowPage, placementRequestWithoutBooking)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()
    showPage.shouldShowMatchingInformationSummary()
    showPage.shouldShowPreferredAps(preferredAps)

    // And I should not see any booking information
    showPage.shouldNotShowBookingInformation()

    showPage.shouldShowCreateBookingOption()
    showPage.shouldNotShowAmendBookingOption()
    showPage.shouldNotShowCancelBookingOption()

    // When I go back to the dashboard
    ListPage.visit()

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

    // When I go back to the dashboard
    ListPage.visit()

    // And I click the parole link
    listPage.clickParoleOption()

    // And I click the parole placement request
    listPage.clickPlacementRequest(parolePlacementRequest)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, parolePlacementRequest)

    // And I should see the parole notification banner
    showPage.shouldShowParoleNotification()
  })

  it('allows me to create a booking', () => {
    const premises = premisesFactory.buildList(3)
    cy.task('stubPremises', premises)
    cy.task('stubBookingFromPlacementRequest', placementRequestWithoutBooking)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

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

  it('allows me to amend a booking', () => {
    const premises = premisesFactory.buildList(3)
    cy.task('stubPremises', premises)
    cy.task('stubBookingFromPlacementRequest', placementRequestWithBooking)
    cy.task('stubDateChange', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      bookingId: placementRequestWithBooking.booking.id,
    })
    cy.task('stubBookingGet', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      booking: placementRequestWithBooking.booking,
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithBooking)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, placementRequestWithBooking)

    // When I click on the create booking button
    showPage.clickAmendBooking()

    // Then I should be on the amend a booking page
    const dateChangePage = Page.verifyOnPage(NewDateChangePage, placementRequestWithBooking)

    // And I change the date of my booking
    dateChangePage.completeForm('2023-01-01', '2023-03-02')
    dateChangePage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Booking changed successfully')

    // And the change booking endpoint should have been called with the correct parameters
    cy.task('verifyDateChange', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      bookingId: placementRequestWithBooking.booking.id,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newArrivalDate).equal('2023-01-01')
      expect(requestBody.newDepartureDate).equal('2023-03-02')
    })
  })

  it('allows me to cancel a booking', () => {
    const premises = premisesFactory.buildList(3)
    const cancellation = cancellationFactory.build({ date: '2022-06-01' })

    cy.task('stubPremises', premises)
    cy.task('stubBookingFromPlacementRequest', placementRequestWithBooking)
    cy.task('stubCancellationCreate', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      bookingId: placementRequestWithBooking.booking.id,
      cancellation,
    })
    cy.task('stubBookingGet', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      booking: placementRequestWithBooking.booking,
    })
    cy.task('stubCancellationReferenceData')

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithBooking)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, placementRequestWithBooking)

    // When I click on the create booking button
    showPage.clickCancelBooking()

    // Then I should be on the cancel a booking page
    const cancellationPage = Page.verifyOnPage(CancellationCreatePage, placementRequestWithBooking)

    // And I cancel my booking
    cancellationPage.completeForm(cancellation)
    cancellationPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Booking cancelled')

    // And a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: placementRequestWithBooking.booking.premisesId,
      bookingId: placementRequestWithBooking.booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.date).equal(cancellation.date)
      expect(requestBody.notes).equal(cancellation.notes)
      expect(requestBody.reason).equal(cancellation.reason.id)
    })
  })

  it('allows me to withdraw a placement request', () => {
    cy.task('stubPlacementRequestWithdrawal', placementRequestWithoutBooking)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(placementRequestWithoutBooking)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, placementRequestWithoutBooking)

    // When I click on the withdraw button
    showPage.clickWithdraw()

    // Then I should be on the withdrawal confirmation page
    const withdrawConfirmPage = Page.verifyOnPage(WithdrawConfirmPage)

    // And I cancel my booking
    withdrawConfirmPage.completeForm()
    withdrawConfirmPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Placement request withdrawn successfully')

    // And a withdrawal should have been created in the API
    cy.task('verifyPlacementRequestWithdrawal', placementRequestWithoutBooking).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    cy.task('stubPlacementRequestsDashboard', { placementRequests, isParole: false, page: '2' })
    cy.task('stubPlacementRequestsDashboard', { placementRequests, isParole: false, page: '9' })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests(placementRequests)

    // When I click next
    listPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyPlacementRequestsDashboard', { page: '2', isParole: false }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I click on a page number
    listPage.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyPlacementRequestsDashboard', { page: '9', isParole: false }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports sorting', () => {
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests,
      isParole: false,
      sortBy: 'expectedArrival',
      sortDirection: 'asc',
    })
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests,
      isParole: false,
      sortBy: 'expectedArrival',
      sortDirection: 'desc',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests(placementRequests)

    // When I sort by expected arrival in ascending order
    listPage.clickSortBy('expectedArrival')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('expectedArrival', 'ascending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyPlacementRequestsDashboard', {
      isParole: false,
      sortBy: 'expectedArrival',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I sort by expected arrival in descending order
    listPage.clickSortBy('expectedArrival')

    // Then the dashboard should be sorted by expected arrival in descending order
    listPage.shouldBeSortedByField('expectedArrival', 'descending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyPlacementRequestsDashboard', {
      isParole: false,
      sortBy: 'expectedArrival',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
})
