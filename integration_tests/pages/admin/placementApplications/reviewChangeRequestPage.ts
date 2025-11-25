import { Cas1ChangeRequest, Cas1PlacementRequestDetail } from '@approved-premises/api'
import Page from '../../page'
import { changeRequestSummaryList } from '../../../../server/utils/placementRequests/changeRequestSummaryList'
import { placementSummaryList } from '../../../../server/utils/placementRequests/placementSummaryList'
import paths from '../../../../server/paths/admin'

export default class ReviewChangeRequestPage extends Page {
  constructor(
    private readonly placementRequest: Cas1PlacementRequestDetail,
    private readonly changeRequest: Cas1ChangeRequest,
    expectUnauthorised = false,
  ) {
    super(expectUnauthorised ? `Authorisation Error` : 'Review appeal')
  }

  static visitUnauthorised(placementRequest: Cas1PlacementRequestDetail, changeRequest: Cas1ChangeRequest) {
    cy.visit(
      paths.admin.placementRequests.changeRequests.review({
        placementRequestId: placementRequest.id,
        changeRequestId: changeRequest.id,
      }),
      { failOnStatusCode: false },
    )
    return new ReviewChangeRequestPage(placementRequest, changeRequest, true)
  }

  shouldContainSummaryInformation() {
    this.shouldContainSummaryListItems(changeRequestSummaryList(this.changeRequest).rows)
    this.shouldContainSummaryListItems(placementSummaryList(this.placementRequest.spaceBookings[0]).rows)
  }
}
