import { formatDate } from 'date-fns/format'
import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'

import {
  applicationFactory,
  applicationSummaryFactory,
  bookingFactory,
  bookingSummaryFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cruManagementAreaFactory,
  newCancellationFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
  premisesFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import CreatePlacementPage from '../../pages/admin/placementApplications/createPlacementPage'
import { CancellationCreatePage, NewDateChangePage, UnableToMatchPage } from '../../pages/manage'
import { addResponseToFormArtifact } from '../../../server/testutils/addToApplication'
import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import { signIn } from '../signIn'
import { withdrawPlacementRequestOrApplication } from '../../support/helpers'
import paths from '../../../server/paths/api'
import BookingCancellationConfirmPage from '../../pages/manage/bookingCancellationConfirmation'
import { allReleaseTypes } from '../../../server/utils/applications/releaseTypeUtils'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('Placement Requests', () => {
  const stubArtifacts = (applicationData: Record<string, unknown> = {}) => {
    let application = applicationFactory.build(applicationData)
    const unmatchedPlacementRequests = [
      placementRequestFactory.notMatched().build({ applicationId: application.id }),
      placementRequestFactory.notMatched().build({ isParole: true }),
    ]
    const matchedPlacementRequests = placementRequestFactory.buildList(3)
    const unableToMatchPlacementRequests = placementRequestFactory.unableToMatch().buildList(2)

    const unmatchedPlacementRequest = placementRequestDetailFactory.build({
      ...unmatchedPlacementRequests[0],
      spaceBookings: [],
    })

    const parolePlacementRequest = placementRequestDetailFactory.build({
      ...unmatchedPlacementRequests[1],
      spaceBookings: [],
    })

    const matchedPlacementRequest = placementRequestDetailFactory.build(matchedPlacementRequests[1])
    const spaceBooking = cas1SpaceBookingFactory.build({
      applicationId: application.id,
      premises: { id: matchedPlacementRequest.booking.premisesId },
      id: matchedPlacementRequest.booking.id,
    })
    const legacyBooking = bookingSummaryFactory.build({
      type: 'legacy',
    })
    const matchedPlacementRequestWithLegacyBooking = placementRequestDetailFactory.build({
      ...matchedPlacementRequests[2],
      booking: legacyBooking,
      legacyBooking,
      spaceBookings: [],
    })
    const unableToMatchPlacementRequest = placementRequestDetailFactory.build(unableToMatchPlacementRequests[0])

    const preferredAps = premisesFactory.buildList(3)

    const cruManagementAreas = cruManagementAreaFactory.buildList(5)
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
    cy.task('stubPlacementRequest', matchedPlacementRequestWithLegacyBooking)
    cy.task('stubPlacementRequest', unableToMatchPlacementRequest)
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })

    const cas1premises = cas1PremisesBasicSummaryFactory.buildList(3, { supportsSpaceBookings: false })
    const cas1SpaceBookingPremises = cas1PremisesBasicSummaryFactory.buildList(2, { supportsSpaceBookings: true })
    cy.task('stubCas1AllPremises', [...cas1premises, ...cas1SpaceBookingPremises])
    cy.task('stubBookingFromPlacementRequest', unmatchedPlacementRequest)

    return {
      application,
      unmatchedPlacementRequest,
      unmatchedPlacementRequests,
      parolePlacementRequest,
      matchedPlacementRequest,
      matchedPlacementRequestWithLegacyBooking,
      matchedPlacementRequests,
      unableToMatchPlacementRequest,
      unableToMatchPlacementRequests,
      cruManagementAreas,
      preferredAps,
      spaceBooking,
      cas1premises,
      cas1SpaceBookingPremises,
    }
  }

  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member
    signIn('cru_member')
  })

  it('allows me to view all placement requests', () => {
    const {
      unmatchedPlacementRequest,
      unmatchedPlacementRequests,
      unableToMatchPlacementRequests,
      matchedPlacementRequests,
      matchedPlacementRequest,
      matchedPlacementRequestWithLegacyBooking,
      parolePlacementRequest,
    } = stubArtifacts()
    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of unmatched placement requests
    listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

    // When I click the unable to match link
    listPage.clickUnableToMatch()

    // Then I should see a list of unable to match palcement requests
    listPage.shouldShowPlacementRequests(unableToMatchPlacementRequests, 'unableToMatch')

    // When I click the matched link
    listPage.clickMatched()

    // Then I should see a list of matched placement requests
    listPage.shouldShowPlacementRequests(matchedPlacementRequests, 'matched')

    // When I click the awaiting match link
    listPage.clickReadyToMatch()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    let showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

    // And I should see the Key-person details in the blue banner
    showPage.shouldShowKeyPersonDetails(unmatchedPlacementRequest)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()

    // And I should not see any booking information
    showPage.shouldNotShowBookingInformation()

    showPage.shouldShowCreateBookingOption()
    showPage.shouldNotShowAmendBookingOption()
    showPage.shouldNotShowChangePlacementOption()
    showPage.shouldNotShowCancelBookingOption()

    // When I go back to the dashboard
    ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I click the placement request with a space booking
    listPage.clickPlacementRequest(matchedPlacementRequest)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()

    showPage.shouldNotShowCreateBookingOption()
    showPage.shouldNotShowAmendBookingOption()
    showPage.shouldShowChangePlacementOption()
    showPage.shouldShowCancelBookingOption()

    // And I should see the booking information
    showPage.shouldShowBookingInformation()

    // When I go back to the dashboard
    ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I click the placement request with a legacy booking
    listPage.clickPlacementRequest(matchedPlacementRequestWithLegacyBooking)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequestWithLegacyBooking)

    // And I should see the information about the placement request
    showPage.shouldShowSummary()

    showPage.shouldNotShowCreateBookingOption()
    showPage.shouldShowAmendBookingOption()
    showPage.shouldNotShowChangePlacementOption()
    showPage.shouldShowCancelBookingOption()

    // And I should see the booking information
    showPage.shouldShowLegacyBookingInformation()

    // When I go back to the dashboard
    ListPage.visit()

    // And I click the parole placement request
    listPage.clickPlacementRequest(parolePlacementRequest)

    // Then I should be taken to the placement request page
    showPage = Page.verifyOnPage(ShowPage, parolePlacementRequest)

    // And I should see the parole notification banner
    showPage.shouldShowParoleNotification()
  })

  it('allows me to download the CRU occupancy report', () => {
    stubArtifacts()
    const filename = `premises-occupancy_${formatDate(new Date(), 'yyyyMMdd_HHmm')}.csv`
    cy.task('stubOccupancyReportDownload', { filename })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I click the 'Download CRU occupancy report' action
    listPage.expectDownload()
    listPage.clickAction('Download CRU occupancy report')

    // Then the report should be downloaded
    listPage.shouldHaveDownloadedFile(filename)
  })

  it('allows me to create a booking', () => {
    const { unmatchedPlacementRequest, cas1premises, cas1SpaceBookingPremises } = stubArtifacts({
      isWomensApplication: false,
    })

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

    // And only legacy premises, that don't support space bookings, are available for selection
    createPage.premisesShouldNotBeAvailable(cas1SpaceBookingPremises[0])

    // When I complete the form
    createPage.completeForm('2022-01-01', '2022-02-01', cas1premises[0])
    createPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Placement created for ', { exact: false })

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', unmatchedPlacementRequest).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain({
        premisesId: cas1premises[0].id,
        arrivalDate: '2022-01-01',
        departureDate: '2022-02-01',
      })
    })
  })

  it('allows me to create a booking for the womens estate', () => {
    const { unmatchedPlacementRequest, cas1premises } = stubArtifacts({ isWomensApplication: true })

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
    createPage.completeForm('2022-01-01', '2022-02-01', cas1premises[0])
    createPage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Placement created for ', { exact: false })

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', unmatchedPlacementRequest).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain({
        premisesId: cas1premises[0].id,
        arrivalDate: '2022-01-01',
        departureDate: '2022-02-01',
      })
    })
  })

  it('allows me to amend a legacy booking', () => {
    const { matchedPlacementRequestWithLegacyBooking } = stubArtifacts()
    cy.task('stubDateChange', {
      premisesId: matchedPlacementRequestWithLegacyBooking.booking.premisesId,
      bookingId: matchedPlacementRequestWithLegacyBooking.booking.id,
    })
    cy.task('stubBookingGet', {
      premisesId: matchedPlacementRequestWithLegacyBooking.booking.premisesId,
      booking: bookingFactory.build({ id: matchedPlacementRequestWithLegacyBooking.booking.id }),
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I choose a placement request
    listPage.clickPlacementRequest(matchedPlacementRequestWithLegacyBooking)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequestWithLegacyBooking)

    // When I click on the create booking button
    showPage.clickAmendBooking()

    // Then I should be on the amend a booking page
    const dateChangePage = Page.verifyOnPage(NewDateChangePage, matchedPlacementRequestWithLegacyBooking)

    // And I change the date of my booking
    dateChangePage.completeForm('2023-01-01', '2023-03-02')
    dateChangePage.clickSubmit()

    // Then I should see a confirmation message
    showPage.shouldShowBanner('Booking changed successfully')

    // And the change booking endpoint should have been called with the correct parameters
    cy.task('verifyDateChange', {
      premisesId: matchedPlacementRequestWithLegacyBooking.booking.premisesId,
      bookingId: matchedPlacementRequestWithLegacyBooking.booking.id,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newArrivalDate).equal('2023-01-01')
      expect(requestBody.newDepartureDate).equal('2023-03-02')
    })
  })

  it('allows me to cancel a booking', () => {
    const { matchedPlacementRequest, spaceBooking } = stubArtifacts()
    const cancellation = newCancellationFactory.build()
    const withdrawable = withdrawableFactory.build({ id: matchedPlacementRequest.booking.id, type: 'booking' })
    cy.task('stubBookingFromPlacementRequest', matchedPlacementRequest)
    cy.task('stubCancellationCreate', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
      cancellation,
    })
    cy.task('stubBookingGet', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      booking: bookingFactory.build({ id: matchedPlacementRequest.booking.id }),
    })
    cy.task('stubCancellationReferenceData')
    const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

    cy.task('stubWithdrawablesWithNotes', {
      applicationId: matchedPlacementRequest.applicationId,
      withdrawables,
    })
    cy.task('stubBookingFindWithoutPremises', spaceBooking)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I click the matched link
    listPage.clickMatched()

    // And I choose a placement request
    listPage.clickPlacementRequest(matchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

    // When I click on the create booking button
    showPage.clickWithdrawBooking()

    const withdrawableTypePage = new NewWithdrawalPage('What do you want to withdraw?')
    withdrawableTypePage.selectType('placement')
    withdrawableTypePage.clickSubmit()

    const withdrawablePage = new NewWithdrawalPage('Select your placement')
    withdrawablePage.shouldShowWithdrawableGuidance('placement')
    withdrawablePage.selectWithdrawable(withdrawable.id)
    withdrawablePage.clickSubmit()

    // Then I should be on the cancel a booking page
    const cancellationPage = Page.verifyOnPage(CancellationCreatePage, matchedPlacementRequest)

    // And I cancel my booking
    cancellationPage.completeForm(cancellation)

    // Then I should see a confirmation message
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()

    // And a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: matchedPlacementRequest.booking.premisesId,
      bookingId: matchedPlacementRequest.booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.reason).equal(cancellation.reason)
    })
  })

  it('allows me to withdraw a placement request', () => {
    const { matchedPlacementRequest, unmatchedPlacementRequest, application } = stubArtifacts()
    cy.task('stubPlacementRequestWithdrawal', unmatchedPlacementRequest)
    const withdrawable = withdrawableFactory.build({ id: unmatchedPlacementRequest.id, type: 'placement_request' })
    const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

    cy.task('stubWithdrawablesWithNotes', {
      applicationId: matchedPlacementRequest.applicationId,
      withdrawables,
    })
    cy.task('stubWithdrawablesWithNotes', {
      applicationId: application.id,
      withdrawables,
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // And I choose a placement request
    listPage.clickPlacementRequest(unmatchedPlacementRequest)

    // Then I should be taken to the placement request page
    const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

    // When I click on the withdraw button
    showPage.clickWithdraw()

    withdrawPlacementRequestOrApplication(withdrawable, showPage, application.id)

    // And the API should have been called with the withdrawal reason
    cy.task('verifyPlacementRequestWithdrawal', withdrawable).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(paths.placementRequests.withdrawal.create({ id: withdrawable.id }))

      const body = JSON.parse(requests[0].body)

      expect(body.reason).to.equal('DuplicatePlacementRequest')
    })
  })

  it('allows me to mark a placement request as unable to match', () => {
    const { unmatchedPlacementRequest } = stubArtifacts()
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
    showPage.shouldShowBanner('Placement request has been marked as unable to match')

    // And the placement should have been marked unable to match in the API
    cy.task('verifyPlacementRequestedMarkedUnableToMatch', unmatchedPlacementRequest).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    const { unmatchedPlacementRequests } = stubArtifacts()
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
  ;(
    [
      'expected_arrival',
      'person_name',
      'person_risks_tier',
      'expected_arrival',
      'application_date',
      'duration',
      'request_type',
    ] as const
  ).forEach(field => {
    it(`supports sorting by ${field}`, () => {
      const { unmatchedPlacementRequests } = stubArtifacts()
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

  it(`supports filtering`, () => {
    const { unmatchedPlacementRequests, matchedPlacementRequests, unableToMatchPlacementRequests, cruManagementAreas } =
      stubArtifacts()
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: [
        ...unmatchedPlacementRequests,
        ...matchedPlacementRequests,
        ...unableToMatchPlacementRequests,
      ],
      status: 'notMatched',
      sortBy: 'created_at',
      sortDirection: 'asc',
    })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: matchedPlacementRequests, status: 'matched' })

    // Given I am on the placement request dashboard
    const listPage = ListPage.visit()

    // When I filter by AP area and request type
    listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[1].name)
    listPage.getSelectInputByIdAndSelectAnEntry('requestType', 'parole')
    listPage.clickApplyFilters()

    // Then the API should receive a request with the correct query parameters
    cy.task('verifyPlacementRequestsDashboard', {
      status: 'notMatched',
    }).then(requests => {
      expect(requests).to.have.length(2)
      const { cruManagementAreaId, requestType } = requests[1].queryParams

      expect(cruManagementAreaId.values).to.deep.equal([cruManagementAreas[1].id])
      expect(requestType.values).to.deep.equal(['parole'])
    })

    // When I click the matched link tab
    listPage.clickMatched()

    // Then the page should retain the area and request type filter
    listPage.shouldHaveSelectText('cruManagementArea', cruManagementAreas[1].name)
    listPage.shouldHaveSelectText('requestType', 'Parole')
  })

  it('retains the status filter when applying other filters', () => {
    const { unmatchedPlacementRequests, matchedPlacementRequests, unableToMatchPlacementRequests, cruManagementAreas } =
      stubArtifacts()
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: [
        ...unmatchedPlacementRequests,
        ...matchedPlacementRequests,
        ...unableToMatchPlacementRequests,
      ],
      status: 'notMatched',
      sortBy: 'created_at',
      sortDirection: 'asc',
    })

    // Given I am on the placement request dashboard filtering by the unableToMatch status
    const listPage = ListPage.visit('status=unableToMatch')

    // When I filter by AP area and request type
    listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[2].name)
    listPage.getSelectInputByIdAndSelectAnEntry('requestType', 'parole')
    listPage.clickApplyFilters()

    // Then the status filter should be retained
    listPage.shouldHaveActiveTab('Unable to match')
  })

  it('should list applications that have no placement request', () => {
    const { cruManagementAreas } = stubArtifacts()

    const applications = applicationSummaryFactory.buildList(2)

    cy.task('stubAllApplications', { applications, page: '1', sortDirection: 'asc' })

    // Given I am on the placement request dashboard filtering by the pendingPlacement status
    const listPage = ListPage.visit('status=pendingPlacement')

    // Then I should see a list of applications with no placement requests
    listPage.shouldShowApplications(applications)

    cy.task('verifyDashboardRequest', { status: 'pendingPlacementRequest', sortDirection: 'asc' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the Request Type filter should not be visible
    listPage.shouldNotShowRequestTypeFilter()

    // When I filter by AP area
    const areaApplications = applicationSummaryFactory.buildList(2)
    cy.task('stubAllApplications', {
      applications: areaApplications,
      page: '1',
      sortDirection: 'asc',
      searchOptions: { cruManagementAreaId: cruManagementAreas[3].id, releaseType: 'rotl' },
    })
    listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[3].name)
    listPage.getSelectInputByIdAndSelectAnEntry('releaseType', allReleaseTypes.rotl)
    listPage.clickApplyFilters()

    // Then I should see a list of applications with no placement requests for that area
    listPage.shouldShowApplications(areaApplications)

    cy.task('verifyDashboardRequest', {
      status: 'pendingPlacementRequest',
      sortDirection: 'asc',
      searchOptions: { cruManagementAreaId: cruManagementAreas[3].id, releaseType: 'rotl' },
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
  ;(['tier', 'releaseType'] as const).forEach(field => {
    it(`supports pending placement requests sorting by ${field}`, () => {
      stubArtifacts()
      const applications = applicationSummaryFactory.buildList(2)
      cy.task('stubAllApplications', { applications, page: '1', sortDirection: 'asc' })
      cy.task('stubAllApplications', {
        applications,
        sortBy: field,
        sortDirection: 'asc',
        searchOptions: { status: 'pendingPlacementRequest' },
      })

      cy.task('stubAllApplications', {
        applications,
        sortBy: field,
        sortDirection: 'desc',
        searchOptions: { status: 'pendingPlacementRequest' },
      })

      // Given I am on the placement request dashboard filtering by the pendingPlacement status
      const listPage = ListPage.visit('status=pendingPlacement')

      // Then I should see a list of applications with no placement requests
      listPage.shouldShowApplications(applications)

      // When I sort by expected arrival in ascending order
      listPage.clickSortBy(field)

      // Then the dashboard should be sorted by field
      listPage.shouldBeSortedByField(field, 'ascending')

      // And the API should have received a request for the correct sort order
      cy.task('verifyDashboardRequest', {
        status: 'pendingPlacementRequest',
        sortBy: field,
        sortDirection: 'asc',
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // When I sort by  descending order
      listPage.clickSortBy(field)

      // Then the dashboard should be sorted in descending order
      listPage.shouldBeSortedByField(field, 'descending')

      // And the API should have received a request for the correct sort order
      cy.task('verifyDashboardRequest', {
        status: 'pendingPlacementRequest',
        sortBy: field,
        sortDirection: 'desc',
      }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })
  })
})
