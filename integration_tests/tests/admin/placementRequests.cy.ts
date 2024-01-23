import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'

import {
  applicationFactory,
  cancellationFactory,
  placementRequestDetailFactory,
  placementRequestWithFullPersonFactory,
  premisesFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import CreatePlacementPage from '../../pages/admin/placementApplications/createPlacementPage'
import { CancellationCreatePage, NewDateChangePage, UnableToMatchPage, WithdrawConfirmPage } from '../../pages/manage'
import { addResponseToFormArtifact } from '../../../server/testutils/addToApplication'
import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import { signIn } from '../signIn'

context('Placement Requests', () => {
  const unmatchedPlacementRequests = [
    placementRequestWithFullPersonFactory.build(),
    placementRequestWithFullPersonFactory.build({ isParole: true }),
  ]
  const matchedPlacementRequests = placementRequestWithFullPersonFactory.buildList(2, { status: 'matched' })
  const unableToMatchPlacementRequests = placementRequestWithFullPersonFactory.buildList(2, { status: 'unableToMatch' })

  const unmatchedPlacementRequest = placementRequestDetailFactory.build({
    ...unmatchedPlacementRequests[0],
    status: 'notMatched',
    booking: undefined,
  })

  const parolePlacementRequest = unmatchedPlacementRequests[1]

  const matchedPlacementRequest = placementRequestDetailFactory.build({ ...matchedPlacementRequests[1] })
  const unableToMatchPlacementRequest = placementRequestDetailFactory.build({ ...unableToMatchPlacementRequests[0] })

  const preferredAps = premisesFactory.buildList(3)
  let application = applicationFactory.build()

  beforeEach(() => {
    cy.task('reset')

    signIn(['workflow_manager'])

    application = addResponseToFormArtifact(application, {
      task: 'location-factors',
      page: 'preferred-aps',
      key: 'selectedAps',
      value: preferredAps,
    }) as Application

    unmatchedPlacementRequest.application = application

    cy.task('stubPlacementRequestsDashboard', { placementRequests: unmatchedPlacementRequests, status: 'notMatched' })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: matchedPlacementRequests, status: 'matched' })
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: unableToMatchPlacementRequests,
      status: 'unableToMatch',
    })

    cy.task('stubPlacementRequest', parolePlacementRequest)
    cy.task('stubPlacementRequest', unmatchedPlacementRequest)
    cy.task('stubPlacementRequest', matchedPlacementRequest)
    cy.task('stubPlacementRequest', unableToMatchPlacementRequest)
  })

  it('allows me to view a placement request', () => {
    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

    // When I click the unable to match link
    listPage.clickUnableToMatch()

    // Then I should see the unable to match requests listed
    listPage.shouldShowPlacementRequests(unableToMatchPlacementRequests, 'unableToMatch')

    // When I click the matched link
    listPage.clickMatched()

    // Then I should see the matched requests listed
    listPage.shouldShowPlacementRequests(matchedPlacementRequests, 'matched')

    // When I click the awaiting match link
    listPage.clickReadyToMatch()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    let showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

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

    // And I click the matched link
    listPage.clickMatched()

    // And I click the placement request with a booking
    listPage.clickPlacementRequest(matchedPlacementRequest)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

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

    // And I click the parole placement request
    listPage.clickPlacementRequest(parolePlacementRequest)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, parolePlacementRequest)

    // And I should see the parole notification banner
    showPage.shouldShowParoleNotification()
  })

  it('allows me to create a booking', () => {
    const premises = premisesSummaryFactory.buildList(3)
    cy.task('stubAllPremises', premises)
    cy.task('stubBookingFromPlacementRequest', unmatchedPlacementRequest)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

    // When I click on the create booking button
    showPage.clickCreateBooking()

    // Then I should be on the create a booking page
    const createPage = Page.verifyOnPage(CreatePlacementPage, unmatchedPlacementRequest)

    // And the dates should be prepopulated
    createPage.dateInputsShouldBePrepopulated()

    // When I complete the form
    createPage.completeForm('2022-01-01', '2022-02-01', premises[0])
    createPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Placement created')

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', unmatchedPlacementRequest).then(requests => {
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
    cy.task('stubAllPremises', premises)
    cy.task('stubBookingFromPlacementRequest', matchedPlacementRequest)
    cy.task('stubDateChange', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
    })
    cy.task('stubBookingGet', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      booking: matchedPlacementRequest.booking,
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I choose a placement request
    listPage.clickPlacementRequest(matchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

    // When I click on the create booking button
    showPage.clickAmendBooking()

    // Then I should be on the amend a booking page
    const dateChangePage = Page.verifyOnPage(NewDateChangePage, matchedPlacementRequest)

    // And I change the date of my booking
    dateChangePage.completeForm('2023-01-01', '2023-03-02')
    dateChangePage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Booking changed successfully')

    // And the change booking endpoint should have been called with the correct parameters
    cy.task('verifyDateChange', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
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

    cy.task('stubAllPremises', premises)
    cy.task('stubBookingFromPlacementRequest', matchedPlacementRequest)
    cy.task('stubCancellationCreate', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
      cancellation,
    })
    cy.task('stubBookingGet', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      booking: matchedPlacementRequest.booking,
    })
    cy.task('stubCancellationReferenceData')

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I choose a placement request
    listPage.clickPlacementRequest(matchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

    // When I click on the create booking button
    showPage.clickCancelBooking()

    // Then I should be on the cancel a booking page
    const cancellationPage = Page.verifyOnPage(CancellationCreatePage, matchedPlacementRequest)

    // And I cancel my booking
    cancellationPage.completeForm(cancellation)
    cancellationPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Booking cancelled')

    // And a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
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
    cy.task('stubPlacementRequestWithdrawal', unmatchedPlacementRequest)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

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
    cy.task('verifyPlacementRequestWithdrawal', unmatchedPlacementRequest).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('allows me to mark a placement request as unable to match', () => {
    cy.task('stubPlacementRequestUnableToMatch', unmatchedPlacementRequest)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

    // When I click on the unable to match button
    showPage.clickUnableToMatch()

    // Then I should be on the unable to match confirmation page
    const unableToMatchConfirmationPage = Page.verifyOnPage(UnableToMatchPage)

    // When I confirm I am unable to match the placement
    unableToMatchConfirmationPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Application has been marked unable to match')

    // And the placement should have been marked unable to match in the API
    cy.task('verifyPlacementRequestedMarkedUnableToMatch', unmatchedPlacementRequest).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: unmatchedPlacementRequests,
      status: 'notMatched',
      page: '2',
    })
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: unmatchedPlacementRequests,
      status: 'notMatched',
      page: '9',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowPlacementRequests(unmatchedPlacementRequests)

    // When I click next
    listPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyPlacementRequestsDashboard', { page: '2', status: 'notMatched' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // When I click on a page number
    listPage.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyPlacementRequestsDashboard', { page: '9', status: 'notMatched' }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
  ;[
    'expected_arrival',
    'person_name',
    'person_risks_tier',
    'expected_arrival',
    'application_date',
    'duration',
    'request_type',
  ].forEach(field => {
    it(`supports sorting by ${field}`, () => {
      cy.task('stubPlacementRequestsDashboard', {
        placementRequests: unmatchedPlacementRequests,
        status: 'notMatched',
        sortBy: field,
        sortDirection: 'asc',
      })
      cy.task('stubPlacementRequestsDashboard', {
        placementRequests: unmatchedPlacementRequests,
        status: 'notMatched',
        sortBy: field,
        sortDirection: 'desc',
      })

      // When I visit the tasks dashboard
      const listPage = ListPage.visit()

      // Then I should see a list of placement requests
      listPage.shouldShowPlacementRequests(unmatchedPlacementRequests)

      // When I sort by expected arrival in ascending order
      listPage.clickSortBy(field)

      // Then the dashboard should be sorted by expected arrival
      listPage.shouldBeSortedByField(field, 'ascending')

      // And the API should have received a request for the correct sort order
      cy.task('verifyPlacementRequestsDashboard', {
        status: 'notMatched',
        sortBy: field,
        sortDirection: 'asc',
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // When I sort by expected arrival in descending order
      listPage.clickSortBy(field)

      // Then the dashboard should be sorted by expected arrival in descending order
      listPage.shouldBeSortedByField(field, 'descending')

      // And the API should have received a request for the correct sort order
      cy.task('verifyPlacementRequestsDashboard', {
        status: 'notMatched',
        sortBy: field,
        sortDirection: 'desc',
      }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })
  })
})
