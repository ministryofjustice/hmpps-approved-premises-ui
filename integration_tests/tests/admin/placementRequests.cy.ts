import { formatDate } from 'date-fns/format'
import ListPage from '../../pages/admin/placementApplications/listPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'

import {
  applicationFactory,
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
import { ApprovedPremisesApplication as Application, FullPerson } from '../../../server/@types/shared'
import { signIn } from '../signIn'
import { withdrawPlacementRequestOrApplication } from '../../support/helpers'
import paths from '../../../server/paths/api'
import BookingCancellationConfirmPage from '../../pages/manage/bookingCancellationConfirmation'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Placement Requests', () => {
  const stubArtifacts = (applicationData: Record<string, unknown> = {}) => {
    let application = applicationFactory.build(applicationData)

    const unmatchedPlacementRequests = [
      cas1PlacementRequestSummaryFactory.notMatched().build({ applicationId: application.id }),
      cas1PlacementRequestSummaryFactory.notMatched().build({ isParole: true }),
    ]
    const matchedPlacementRequests = cas1PlacementRequestSummaryFactory.matched().buildList(3)
    const unableToMatchPlacementRequests = cas1PlacementRequestSummaryFactory.unableToMatch().buildList(2)

    const unmatchedPlacementRequest = cas1PlacementRequestDetailFactory
      .params(unmatchedPlacementRequests[0])
      .notMatched()
      .build()

    const parolePlacementRequest = cas1PlacementRequestDetailFactory
      .params(unmatchedPlacementRequests[1])
      .withSpaceBooking()
      .build()

    const matchedPlacementRequest = cas1PlacementRequestDetailFactory
      .params({
        id: matchedPlacementRequests[1].id,
        status: 'matched',
      })
      .matched()
      .build()
    const spaceBooking = cas1SpaceBookingFactory.build({
      applicationId: application.id,
      premises: { id: matchedPlacementRequest.booking.premisesId },
      id: matchedPlacementRequest.booking.id,
    })

    const unableToMatchPlacementRequest = cas1PlacementRequestDetailFactory
      .params(unableToMatchPlacementRequests[0])
      .unableToMatch()
      .build()

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
    cy.task('stubPlacementRequestsDashboard', {
      placementRequests: matchedPlacementRequests,
      status: 'matched',
    })
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

      GIVEN('I am signed in as a CRU member')
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

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      THEN('I should see a list of unmatched placement requests')
      listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

      WHEN('I click the Unable to book tab')
      listPage.clickTab('Unable to book')

      THEN('I should see a list of  unable to book placement requests')
      listPage.shouldShowPlacementRequests(unableToMatchPlacementRequests, 'unableToMatch')

      WHEN('I click the Booked tab')
      listPage.clickTab('Booked')

      THEN('I should see a list of matched placement requests')
      listPage.shouldShowPlacementRequests(matchedPlacementRequests, 'matched')

      WHEN('I click the Ready to book tab')
      listPage.clickTab('Ready to book')

      AND('I choose a placement request')
      listPage.clickPlacementRequest(unmatchedPlacementRequest)

      THEN('I should be taken to the placement request page')
      let showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

      AND('I should see the Key-person details in the blue banner')
      showPage.shouldShowKeyPersonDetails(
        unmatchedPlacementRequest.person as FullPerson,
        unmatchedPlacementRequest.risks?.tier?.value?.level,
      )

      AND('I should see the information about the placement request')
      showPage.shouldShowSummary()

      AND('I should not see any booking information')
      showPage.shouldNotShowBookingInformation()

      AND('I should see available actions')
      showPage.shouldHaveActions(['Search for a space', 'Withdraw request for placement', 'Mark as unable to book'])

      WHEN('I go back to the dashboard')
      showPage.clickBack()

      AND('I click the Booked tab')
      listPage.clickTab('Booked')

      AND('I click a placement request with a placement')
      listPage.clickPlacementRequest(matchedPlacementRequest)

      THEN('I should be taken to the placement request page')
      showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

      AND('I should see the information about the placement request')
      showPage.shouldShowSummary()

      AND('I should see available actions')
      showPage.shouldHaveActions(['Change placement', 'Withdraw placement'])

      AND('I should see the booking information')
      showPage.shouldShowBookingInformation()

      WHEN('I go back to the dashboard')
      showPage.clickBack()

      AND('I click the Ready to book tab')
      showPage.clickTab('Ready to book')

      AND('I click the parole placement request')
      listPage.clickPlacementRequest(parolePlacementRequest)

      THEN('I should be taken to the placement request page')
      showPage = Page.verifyOnPage(ShowPage, parolePlacementRequest)

      AND('I should see the parole notification banner')
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

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      AND('I click the Booked tab')
      listPage.clickTab('Booked')

      AND('I choose a placement request')
      listPage.clickPlacementRequest(matchedPlacementRequest)

      THEN('I should be taken to the placement request page')
      const showPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

      WHEN('I click on the create booking button')
      showPage.clickAction('Withdraw placement')

      const withdrawableTypePage = new NewWithdrawalPage('What do you want to withdraw?')
      withdrawableTypePage.selectType('placement')
      withdrawableTypePage.clickSubmit()

      const withdrawablePage = new NewWithdrawalPage('Select your placement')
      withdrawablePage.shouldShowWithdrawableGuidance('placement')
      withdrawablePage.selectWithdrawable(withdrawable.id)
      withdrawablePage.clickSubmit()

      THEN('I should be on the cancel a booking page')
      const cancellationPage = Page.verifyOnPage(CancellationCreatePage, matchedPlacementRequest)

      AND('I cancel my booking')
      cancellationPage.completeForm(cancellation)

      THEN('I should see a confirmation message')
      const confirmationPage = new BookingCancellationConfirmPage()
      confirmationPage.shouldShowPanel()

      AND('a cancellation should have been created in the API')
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

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      AND('I choose a placement request')
      listPage.clickPlacementRequest(unmatchedPlacementRequest)

      THEN('I should be taken to the placement request page')
      const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

      WHEN('I click on the Withdraw action')
      showPage.clickAction('Withdraw request for placement')

      withdrawPlacementRequestOrApplication(withdrawable, showPage, application.id)

      AND('the API should have been called with the withdrawal reason')
      cy.task('verifyPlacementRequestWithdrawal', withdrawable).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(
          paths.placementRequests.withdrawal.create({ placementRequestId: withdrawable.id }),
        )

        const body = JSON.parse(requests[0].body)

        expect(body.reason).to.equal('DuplicatePlacementRequest')
      })
    })

    it('allows me to mark a placement request as  unable to book', () => {
      const { unmatchedPlacementRequest } = stubArtifacts()
      cy.task('stubPlacementRequestUnableToMatch', unmatchedPlacementRequest)

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      AND('I choose a placement request')
      listPage.clickPlacementRequest(unmatchedPlacementRequest)

      THEN('I should be taken to the placement request page')
      const showPage = Page.verifyOnPage(ShowPage, unmatchedPlacementRequest)

      WHEN('I click on the  unable to book button')
      showPage.clickUnableToMatch()

      THEN('I should be on the  unable to book confirmation page')
      const unableToMatchConfirmationPage = Page.verifyOnPage(UnableToMatchPage)

      WHEN('I confirm I am  unable to book the placement')
      unableToMatchConfirmationPage.clickSubmit()

      THEN('I should see a confirmation message')
      showPage.shouldShowBanner('Placement request has been marked as  unable to book')

      AND('the placement should have been marked  unable to book in the API')
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

        WHEN('I visit the tasks dashboard')
        const listPage = ListPage.visit()

        THEN('I should see a list of placement requests')
        listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

        WHEN('I click next')
        listPage.clickNext()

        THEN('the API should have received a request for the next page')
        cy.task('verifyPlacementRequestsDashboard', { page: '2', status: 'notMatched' }).then(requests => {
          expect(requests).to.have.length(1)
        })

        WHEN('I click on a page number')
        listPage.clickPageNumber('9')

        THEN('the API should have received a request for the that page number')
        cy.task('verifyPlacementRequestsDashboard', { page: '9', status: 'notMatched' }).then(requests => {
          expect(requests).to.have.length(1)
        })
      })

      const sortableFields = [
        'expected_arrival',
        'person_name',
        'person_risks_tier',
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

          WHEN('I visit the tasks dashboard')
          const listPage = ListPage.visit()

          THEN('I should see a list of placement requests')
          listPage.shouldShowPlacementRequests(unmatchedPlacementRequests, 'notMatched')

          // The default sort is by expected_arrival, so there is no need to click to sort
          if (field !== 'expected_arrival') {
            WHEN(`I sort by ${field} in ascending order`)
            listPage.clickSortBy(field)
          }

          THEN(`the dashboard should be sorted by ${field}`)
          listPage.shouldBeSortedByField(field, 'ascending')

          AND('the API should have received a request for the correct sort order')
          cy.task('verifyPlacementRequestsDashboard', {
            status: 'notMatched',
            sortBy: field,
            sortDirection: 'asc',
          }).then(requests => {
            expect(requests).to.have.length(1)
          })

          WHEN(`I sort by ${field} in descending order`)
          listPage.clickSortBy(field)

          THEN(`the dashboard should be sorted by ${field} in descending order`)
          listPage.shouldBeSortedByField(field, 'descending')

          AND('the API should have received a request for the correct sort order')
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
        const { matchedPlacementRequests, cruManagementAreas, matchedPlacementRequest } = stubArtifacts()

        GIVEN('I am on the placement request dashboard')
        const listPage = ListPage.visit()

        WHEN('I filter by AP area and request type')
        listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[1].name)
        listPage.getSelectInputByIdAndSelectAnEntry('requestType', 'parole')
        listPage.clickApplyFilter()

        THEN('the API should receive a request with the correct query parameters')
        cy.task('verifyPlacementRequestsDashboard', {
          status: 'notMatched',
        }).then(requests => {
          expect(requests).to.have.length(2)
          const { cruManagementAreaId, requestType } = requests[1].queryParams

          expect(cruManagementAreaId.values).to.deep.equal([cruManagementAreas[1].id])
          expect(requestType.values).to.deep.equal(['parole'])
        })

        WHEN('I click the Booked tab')
        listPage.clickTab('Booked')

        THEN('the page should retain the area and request type filter')
        listPage.shouldHaveSelectText('cruManagementArea', cruManagementAreas[1].name)
        listPage.shouldHaveSelectText('requestType', 'Parole')

        WHEN('I click on a placement request')
        listPage.clickPlacementRequest(matchedPlacementRequest)

        THEN("I should see the placement request's details")
        const placementRequestPage = Page.verifyOnPage(ShowPage, matchedPlacementRequest)

        WHEN('I click the back link')
        placementRequestPage.clickBack()

        THEN('I should be taken back to the placement request dashboard with the correct status and filters applied')
        listPage.shouldShowPlacementRequests(matchedPlacementRequests, 'matched')
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

        GIVEN('I am on the placement request dashboard filtering by the unableToMatch status')
        const listPage = ListPage.visit('status=unableToMatch')

        WHEN('I filter by AP area and request type')
        listPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[2].name)
        listPage.getSelectInputByIdAndSelectAnEntry('requestType', 'parole')
        listPage.clickApplyFilter()

        THEN('the status filter should be retained')
        listPage.shouldHaveActiveTab('Unable to book')
      })
    })

    it('allows me to download the CRU occupancy report', () => {
      stubArtifacts()
      const filename = `premises-occupancy_${formatDate(new Date(), 'yyyyMMdd_HHmm')}.csv`
      cy.task('stubOccupancyReportDownload', { filename })

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      AND("I click the 'Download CRU occupancy report' action")
      listPage.expectDownload()
      listPage.clickAction('Download CRU occupancy report')

      THEN('the report should be downloaded')
      listPage.shouldHaveDownloadedFile(filename)
    })
  })
})
