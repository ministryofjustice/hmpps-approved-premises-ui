import { formatDate } from 'date-fns/format'
import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'

import {
  applicationFactory,
  cas1ApplicationSummaryFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cruManagementAreaFactory,
  newCancellationFactory,
  cas1PlacementRequestDetailFactory,
  premisesFactory,
  withdrawableFactory,
  cas1PlacementRequestSummaryFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CancellationCreatePage, UnableToMatchPage } from '../../pages/manage'
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
      cas1PlacementRequestSummaryFactory.notMatched().build({ applicationId: application.id }),
      cas1PlacementRequestSummaryFactory.notMatched().build({ isParole: true }),
    ]
    const matchedPlacementRequests = cas1PlacementRequestSummaryFactory.matched().buildList(3)
    const unableToMatchPlacementRequests = cas1PlacementRequestSummaryFactory.unableToMatch().buildList(2)

    const unmatchedPlacementRequest = cas1PlacementRequestDetailFactory.build(unmatchedPlacementRequests[0])

    const parolePlacementRequest = cas1PlacementRequestDetailFactory
      .params(unmatchedPlacementRequests[1])
      .withSpaceBooking()
      .build()

    const matchedPlacementRequest = cas1PlacementRequestDetailFactory.build({
      id: matchedPlacementRequests[1].id,
      status: 'matched',
    })
    const spaceBooking = cas1SpaceBookingFactory.build({
      applicationId: application.id,
      premises: { id: matchedPlacementRequest.booking.premisesId },
      id: matchedPlacementRequest.booking.id,
    })

    const unableToMatchPlacementRequest = cas1PlacementRequestDetailFactory.build(unableToMatchPlacementRequests[0])

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
    cy.task('stubPlacementRequest', unableToMatchPlacementRequest)
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })

    const cas1premises = cas1PremisesBasicSummaryFactory.buildList(3, { supportsSpaceBookings: false })
    const cas1SpaceBookingPremises = cas1PremisesBasicSummaryFactory.buildList(2, { supportsSpaceBookings: true })
    cy.task('stubCas1AllPremises', { premises: [...cas1premises, ...cas1SpaceBookingPremises] })
    cy.task('stubBookingFromPlacementRequest', unmatchedPlacementRequest)

    return {
      application,
      unmatchedPlacementRequest,
      unmatchedPlacementRequests,
      parolePlacementRequest,
      matchedPlacementRequest,
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

  describe('as a CRU member', () => {
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
        parolePlacementRequest,
      } = stubArtifacts()
      // When I visit the tasks dashboard
      const listPage = ListPage.visit()

      // Then I should see a list of unmatched placement requests
      listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

      // When I click the Unable to match tab
      listPage.clickTab('Unable to match')

      // Then I should see a list of unable to match placement requests
      listPage.shouldShowPlacementRequests(unableToMatchPlacementRequests, 'unableToMatch')

      // When I click the Matched tab
      listPage.clickTab('Matched')

      // Then I should see a list of matched placement requests
      listPage.shouldShowPlacementRequests(matchedPlacementRequests, 'matched')

      // When I click the Ready to match tab
      listPage.clickTab('Ready to match')

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

      // And I should see available actions
      showPage.shouldHaveActions(['Search for a space', 'Withdraw request for placement', 'Mark as unable to match'])

      // When I go back to the dashboard
      showPage.clickBack()

      // And I click the Matched tab
      listPage.clickTab('Matched')

      // And I click a placement request with a placement
      listPage.clickPlacementRequest(matchedPlacementRequest)

      // Then I should be taken to the placement request page
      showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

      // And I should see the information about the placement request
      showPage.shouldShowSummary()

      // And I should see available actions
      showPage.shouldHaveActions(['Change placement', 'Withdraw placement'])

      // And I should see the booking information
      showPage.shouldShowBookingInformation()

      // When I go back to the dashboard
      showPage.clickBack()

      // And I click the parole placement request
      listPage.clickPlacementRequest(parolePlacementRequest)

      // Then I should be taken to the placement request page
      showPage = Page.verifyOnPage(ShowPage, parolePlacementRequest)

      // And I should see the parole notification banner
      showPage.shouldShowParoleNotification()
    })

    it('allows me to cancel a placement', () => {
      const { matchedPlacementRequest, spaceBooking } = stubArtifacts()
      const cancellation = newCancellationFactory.build()
      const withdrawable = withdrawableFactory.build({ id: matchedPlacementRequest.booking.id, type: 'space_booking' })
      cy.task('stubBookingFromPlacementRequest', matchedPlacementRequest)
      cy.task('stubCancellationCreate', {
        premisesId: matchedPlacementRequest.booking.premisesId,
        placementId: matchedPlacementRequest.booking.id,
        cancellation,
      })
      cy.task('stubCancellationReferenceData')
      const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: matchedPlacementRequest.applicationId,
        withdrawables,
      })
      cy.task('stubSpaceBookingGetWithoutPremises', spaceBooking)

      // When I visit the tasks dashboard
      const listPage = ListPage.visit()

      // And I click the Matched tab
      listPage.clickTab('Matched')

      // And I choose a placement request
      listPage.clickPlacementRequest(matchedPlacementRequest)

      // Then I should be taken to the placement request page
      const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

      // When I click on the create booking button
      showPage.clickAction('Withdraw placement')

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
      cy.task(
        'verifyApiPost',
        paths.premises.placements.cancel({
          premisesId: matchedPlacementRequest.booking.premisesId,
          placementId: matchedPlacementRequest.booking.id,
        }),
      ).then(({ reasonId }) => {
        expect(reasonId).equal(cancellation.reason)
      })
    })

    it('allows me to withdraw a placement request', () => {
      const { unmatchedPlacementRequest, application } = stubArtifacts()

      cy.task('stubPlacementRequestWithdrawal', unmatchedPlacementRequest)

      const withdrawable = withdrawableFactory.build({ id: unmatchedPlacementRequest.id, type: 'placement_request' })
      const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

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

      // When I click on the Withdraw action
      showPage.clickAction('Withdraw request for placement')

      withdrawPlacementRequestOrApplication(withdrawable, showPage, application.id)

      // And the API should have been called with the withdrawal reason
      cy.task('verifyPlacementRequestWithdrawal', withdrawable).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(
          paths.placementRequests.withdrawal.create({ placementRequestId: withdrawable.id }),
        )

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

    describe('pagination, sorting and filtering', () => {
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

      const sortableFields = [
        'expected_arrival',
        'person_name',
        'person_risks_tier',
        'expected_arrival',
        'application_date',
        'duration',
        'request_type',
      ] as const

      sortableFields.forEach(field => {
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
        const {
          unmatchedPlacementRequests,
          matchedPlacementRequests,
          unableToMatchPlacementRequests,
          cruManagementAreas,
        } = stubArtifacts()
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
        listPage.clickApplyFilter()

        // Then the API should receive a request with the correct query parameters
        cy.task('verifyPlacementRequestsDashboard', {
          status: 'notMatched',
        }).then(requests => {
          expect(requests).to.have.length(2)
          const { cruManagementAreaId, requestType } = requests[1].queryParams

          expect(cruManagementAreaId.values).to.deep.equal([cruManagementAreas[1].id])
          expect(requestType.values).to.deep.equal(['parole'])
        })

        // When I click the Matched tab
        listPage.clickTab('Matched')

        // Then the page should retain the area and request type filter
        listPage.shouldHaveSelectText('cruManagementArea', cruManagementAreas[1].name)
        listPage.shouldHaveSelectText('requestType', 'Parole')
      })

      it('retains the status filter when applying other filters', () => {
        const {
          unmatchedPlacementRequests,
          matchedPlacementRequests,
          unableToMatchPlacementRequests,
          cruManagementAreas,
        } = stubArtifacts()
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
        listPage.clickApplyFilter()

        // Then the status filter should be retained
        listPage.shouldHaveActiveTab('Unable to match')
      })
    })

    describe('pending request for placement', () => {
      it('should list applications that have no placement request', () => {
        const { cruManagementAreas } = stubArtifacts()

        const applications = cas1ApplicationSummaryFactory.buildList(2)

        cy.task('stubAllApplications', { applications, page: '1', sortDirection: 'asc' })

        // Given I am on the placement request dashboard filtering by the pendingPlacement status
        const listPage = ListPage.visit('status=pendingPlacement')

        // Then I should see a list of applications with no placement requests
        listPage.shouldShowApplications(applications)

        cy.task('verifyDashboardRequest', {
          status: 'pendingPlacementRequest',
          sortDirection: 'asc',
        }).then(requests => {
          expect(requests).to.have.length(1)
        })

        // And the Request Type filter should not be visible
        listPage.shouldNotShowRequestTypeFilter()

        // When I filter by AP area
        const areaApplications = cas1ApplicationSummaryFactory.buildList(2)
        cy.task('stubAllApplications', {
          applications: areaApplications,
          page: '1',
          sortDirection: 'asc',
          searchOptions: { cruManagementAreaId: cruManagementAreas[3].id, releaseType: 'rotl' },
        })
        listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[3].name)
        listPage.getSelectInputByIdAndSelectAnEntry('releaseType', allReleaseTypes.rotl)
        listPage.clickApplyFilter()

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

      const sortFields = ['tier', 'releaseType'] as const

      sortFields.forEach(field => {
        it(`supports pending placement requests sorting by ${field}`, () => {
          stubArtifacts()
          const applications = cas1ApplicationSummaryFactory.buildList(2)
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
  })
})
