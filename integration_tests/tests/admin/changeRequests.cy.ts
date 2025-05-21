import { signIn } from '../signIn'
import ListPage from '../../pages/admin/placementApplications/listPage'
import Page from '../../pages/page'
import {
  cas1ChangeRequestSummaryFactory,
  cruManagementAreaFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
} from '../../../server/testutils/factories'
import ChangeRequestsListPage from '../../pages/admin/placementApplications/changeRequestsListPage'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import { displayName } from '../../../server/utils/personUtils'

context('Change Requests', () => {
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
      const placementRequestDetail = placementRequestDetailFactory.build({
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
