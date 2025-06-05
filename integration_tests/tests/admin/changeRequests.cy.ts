import { Cas1ApprovedPlacementAppeal, Cas1RejectChangeRequest, NamedId } from '@approved-premises/api'
import { signIn } from '../signIn'
import ListPage from '../../pages/admin/placementApplications/listPage'
import Page from '../../pages/page'
import {
  cas1ChangeRequestFactory,
  cas1ChangeRequestSummaryFactory,
  cas1PlacementRequestDetailFactory,
  cas1SpaceBookingSummaryFactory,
  cruManagementAreaFactory,
  placementRequestFactory,
} from '../../../server/testutils/factories'
import ChangeRequestsListPage from '../../pages/admin/placementApplications/changeRequestsListPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import { displayName } from '../../../server/utils/personUtils'
import ReviewChangeRequestPage from '../../pages/admin/placementApplications/reviewChangeRequestPage'
import apiPaths from '../../../server/paths/api'
import { DateFormats } from '../../../server/utils/dateUtils'

context('Change Requests', () => {
  describe('CRU Dashboard', () => {
    const placementRequests = placementRequestFactory.notMatched().buildList(3)
    const cruManagementAreas = cruManagementAreaFactory.buildList(5)
    const userCruManagementArea = cruManagementAreas[0]

    const appealRequest = cas1ChangeRequestSummaryFactory.build({ type: 'placementAppeal' })
    const transferRequest = cas1ChangeRequestSummaryFactory.build({ type: 'plannedTransfer' })
    const extensionRequest = cas1ChangeRequestSummaryFactory.build({ type: 'placementExtension' })

    const changeRequestsUserArea = [appealRequest, transferRequest, extensionRequest]
    const changeRequestsAllAreas = cas1ChangeRequestSummaryFactory.buildList(9)
    const changeRequestsOtherArea = cas1ChangeRequestSummaryFactory.buildList(2)

    beforeEach(() => {
      cy.task('reset')

      cy.task('stubPlacementRequestsDashboard', { placementRequests })
      cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
      cy.task('stubChangeRequestSummaries', { changeRequests: changeRequestsAllAreas })
      cy.task('stubChangeRequestSummaries', {
        changeRequests: changeRequestsUserArea,
        cruManagementAreaId: userCruManagementArea.id,
      })
      cy.task('stubChangeRequestSummaries', {
        changeRequests: changeRequestsOtherArea,
        cruManagementAreaId: cruManagementAreas[3].id,
      })
    })

    describe('with change requests permissions', () => {
      beforeEach(() => {
        // Given I am signed in as a CRU member
        // TODO: update to simply CRU member once permissions merged
        signIn(['cru_member', 'change_request_dev'], { cruManagementArea: userCruManagementArea })
      })

      it('allows me to view change requests', () => {
        // When I visit the tasks dashboard
        const listPage = ListPage.visit()

        // And I click the Change Requests tab
        listPage.clickTab('Change requests')

        // Then I should see the current change requests
        const changeRequestsListPage = Page.verifyOnPage(ChangeRequestsListPage)

        // And I should see the list of change requests
        changeRequestsListPage.shouldShowChangeRequests(changeRequestsUserArea)

        // When I click on a change request
        const placementRequestPersonName = `${displayName(changeRequestsUserArea[0].person)}, ${changeRequestsUserArea[0].person.crn}`
        const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
          id: changeRequestsUserArea[0].placementRequestId,
        })
        cy.task('stubPlacementRequest', placementRequestDetail)

        changeRequestsListPage.clickLink(placementRequestPersonName)

        // Then I should see the Placement Request page
        Page.verifyOnPage(ShowPage)
      })

      it('allows me to filter by AP area', () => {
        // When I visit the change requests list page
        const changeRequestsListPage = ChangeRequestsListPage.visit()

        // Then I should see the list of change requests
        changeRequestsListPage.shouldShowChangeRequests(changeRequestsUserArea)

        // When I select 'All areas'
        changeRequestsListPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', 'All areas')
        changeRequestsListPage.clickApplyFilter()

        // Then I should see the list of change requests for all areas
        changeRequestsListPage.shouldShowChangeRequests(changeRequestsAllAreas)

        // When I select another area
        changeRequestsListPage.getSelectInputByIdAndSelectAnEntry('cruManagementArea', cruManagementAreas[3].name)
        changeRequestsListPage.clickApplyFilter()

        // Then I should see the list of change requests for the area
        changeRequestsListPage.shouldShowChangeRequests(changeRequestsOtherArea)
      })

      it('allows me to sort the view', () => {
        // When I visit the change requests list page
        const changeRequestsListPage = ChangeRequestsListPage.visit()

        // Then I see the table sorted by 'Name and CRN' ascending
        changeRequestsListPage.shouldBeSortedByColumn('Name and CRN', 'ascending')

        // And I click on the 'Name and CRN' column heading
        changeRequestsListPage.clickSortByColumn('Name and CRN')

        // Then I see the table sorted by 'Name and CRN' descending
        changeRequestsListPage.shouldBeSortedByColumn('Name and CRN', 'descending')

        // When I click on the 'Tier' column heading
        changeRequestsListPage.clickSortByColumn('Tier')

        // Then I see the table sorted by 'Tier' ascending
        changeRequestsListPage.shouldBeSortedByColumn('Tier', 'ascending')

        // When I click on the 'Tier' column heading again
        changeRequestsListPage.clickSortByColumn('Tier')

        // Then I see the table sorted by 'Tier' descending
        changeRequestsListPage.shouldBeSortedByColumn('Tier', 'descending')

        // When I click on the 'Arrival date' column heading
        changeRequestsListPage.clickSortByColumn('Arrival date')

        // Then I see the table sorted by 'Arrival date' ascending
        changeRequestsListPage.shouldBeSortedByColumn('Arrival date', 'ascending')

        // When I click on the 'Arrival date' column heading again
        changeRequestsListPage.clickSortByColumn('Arrival date')

        // Then I see the table sorted by 'Arrival date' descending
        changeRequestsListPage.shouldBeSortedByColumn('Arrival date', 'descending')
      })

      it('allows me to use pagination', () => {
        const allChangeRequests = cas1ChangeRequestSummaryFactory.buildList(15)
        const page1 = allChangeRequests.slice(0, 10)
        const page2 = allChangeRequests.slice(10)

        cy.task('stubChangeRequestSummaries', { changeRequests: allChangeRequests })
        cy.task('stubChangeRequestSummaries', { changeRequests: allChangeRequests, page: 2 })

        // When I visit the change requests list page
        const changeRequestsListPage = ChangeRequestsListPage.visit()

        // Then I should see the first page of change requests
        changeRequestsListPage.shouldShowChangeRequests(page1)

        // And I click to view the next page
        changeRequestsListPage.clickPageNumber('2')

        // Then I should see the second page of change requests
        changeRequestsListPage.shouldShowChangeRequests(page2)
      })
    })

    describe('without change requests permissions', () => {
      it('does not allow me to view change requests', () => {
        // Given I am signed in as an applicant
        signIn('applicant')

        // Then I should see an error if I try to view the Change Requests list page
        ChangeRequestsListPage.visitUnauthorised()
      })
    })
  })

  describe('Placement appeals', () => {
    const placement = cas1SpaceBookingSummaryFactory.build()
    const changeRequestSummary = cas1ChangeRequestSummaryFactory.build({ type: 'placementAppeal' })
    const changeRequest = cas1ChangeRequestFactory
      .placementAppeal()
      .build({ id: changeRequestSummary.id, spaceBookingId: placement.id })
    const placementRequest = cas1PlacementRequestDetailFactory.withSpaceBooking(placement, changeRequestSummary).build()
    const params = { placementRequestId: placementRequest.id, changeRequestId: changeRequest.id }

    const rejectionReasons: Array<NamedId> = [
      { name: 'noSuitableApAvailable', id: 'noSuitableApAvailableId' },
      { name: 'seniorManagementDecision', id: 'seniorManagementDecisionId' },
    ]
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubChangeRequest', { placementRequestId: placementRequest.id, changeRequest })
      cy.task('stubPlacementRequest', placementRequest)
      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      cy.task('stubChangeRequestRejectionReasonsReferenceData', {
        changeRequestType: 'placementAppeal',
        reasons: rejectionReasons,
      })
      cy.task('stubRejectChangeRequest', params)
      cy.task('stubApprovePlacementAppeal', placement)
    })
    describe('with correct permissions', () => {
      beforeEach(() => {
        // Given I am signed in as a CRU member
        // TODO: update to simply CRU member once permissions merged
        signIn(['cru_member', 'change_request_dev'])
      })

      it('allows the user to review and progress placement appeal', () => {
        // When I visit the placement request detail page for a PR with an open appeal
        const showPage = ShowPage.visit(placementRequest)

        // Then I should see a ticket panel
        showPage.shouldShowTicketPanel(
          `Change requested:appeal
        This placement has been appealed`,
          { exact: false },
        )

        // When I click to review the appeal
        showPage.clickLink('Review appeal')

        // Then I should be on the appeal review page
        const reviewPage = Page.verifyOnPage(ReviewChangeRequestPage, placementRequest, changeRequest)
        reviewPage.shouldContainSummaryInformation()

        // When I submit the review page
        reviewPage.clickSubmit()

        // Then I should see an error
        reviewPage.shouldShowErrorMessagesForFields(['decision'], {
          decision: 'You must select a decision',
        })

        // When I select a rejection decision and submit
        reviewPage.checkRadioByNameAndValue('decision', 'progress')
        reviewPage.completeTextArea('notes', 'Some notes')
        reviewPage.clickSubmit()

        // Then I will be on the placementRequest details page again
        showPage.checkOnPage()
        showPage.shouldShowBanner(`Appeal actioned
          The appealed placement has been cancelled. You will need to re-book via the 'Ready to match' list.`)

        // And the API was called to progress the appeal
        cy.task(
          'verifyApiPost',
          apiPaths.premises.placements.appeal({ premisesId: placement.premises.id, placementId: placement.id }),
        ).then(body => {
          const { occurredAt, reasonNotes, placementAppealChangeRequestId } = body as Cas1ApprovedPlacementAppeal
          expect(occurredAt).equal(DateFormats.dateObjToIsoDate(new Date()))
          expect(reasonNotes).equal('Some notes')
          expect(placementAppealChangeRequestId).equal(changeRequest.id)
        })
      })

      it('allows the user to review and reject placement appeal', () => {
        // When I visit the placement request detail page for a PR with an open appeal
        const showPage = ShowPage.visit(placementRequest)

        // Then I should see a ticket panel
        showPage.shouldShowTicketPanel(
          `Change requested:appeal
        This placement has been appealed`,
          { exact: false },
        )

        // When I click to review the appeal
        showPage.clickLink('Review appeal')

        // Then I should be on the appeal review page
        const reviewPage = Page.verifyOnPage(ReviewChangeRequestPage, placementRequest, changeRequest)
        reviewPage.shouldContainSummaryInformation()

        // When I select a rejection decision and submit
        reviewPage.checkRadioByNameAndValue('decision', rejectionReasons[0].name)
        reviewPage.completeTextArea('notes', 'Some rejection notes')
        reviewPage.clickSubmit()

        // Then I will be on the placementRequest details page again
        showPage.checkOnPage()
        showPage.shouldShowBanner(`Appeal rejected
          The placement remains in place. An email will be sent to the AP manager that made the appeal.`)

        // And the API was called to reject the appeal
        cy.task('verifyApiPatch', apiPaths.placementRequests.changeRequest(params)).then(body => {
          const {
            rejectionReasonId,
            decisionJson: { notes },
          } = body as Cas1RejectChangeRequest
          expect(rejectionReasonId).equal(rejectionReasons[0].id)
          expect(notes).equal('Some rejection notes')
        })
      })
    })

    describe('without permissions', () => {
      beforeEach(() => {
        // Given I am signed in as a CRU member without change request rights
        signIn(['cru_member'])
      })

      it('Should not show the change request banner on the placementRequest details page', () => {
        // When I visit the placementRequest details page
        const showPage = ShowPage.visit(placementRequest)

        // Then I should NOT see a ticket panel
        showPage.shouldNotShowTicketPanel()
      })

      it('Should not alllow user to open review page', () => {
        ReviewChangeRequestPage.visitUnauthorised(placementRequest, changeRequest)
      })
    })
  })
})
