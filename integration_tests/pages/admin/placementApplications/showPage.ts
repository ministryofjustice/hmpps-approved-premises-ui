import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import Page from '../../page'

import { placementRequestSummaryList } from '../../../../server/utils/placementRequests/placementRequestSummaryList'
import { placementSummaryList } from '../../../../server/utils/placementRequests/placementSummaryList'

import paths from '../../../../server/paths/admin'
import matchPaths from '../../../../server/paths/match'
import applyPaths from '../../../../server/paths/apply'
import managePaths from '../../../../server/paths/manage'

export default class ShowPage extends Page {
  constructor(private readonly placementRequest: Cas1PlacementRequestDetail) {
    super('Placement request')

    this.actions = {
      'Search for a space': matchPaths.v2Match.placementRequests.search.spaces({
        placementRequestId: placementRequest.id,
      }),
      'Withdraw request for placement': applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
      'Mark as unable to match': matchPaths.placementRequests.bookingNotMade.confirm({
        placementRequestId: placementRequest.id,
      }),
      'Withdraw placement': applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
    }

    if (placementRequest.booking) {
      this.actions['Change placement'] = managePaths.premises.placements.changes.new({
        premisesId: placementRequest.booking.premisesId,
        placementId: placementRequest.booking.id,
      })
    }
  }

  static visit(placementRequestDetail: Cas1PlacementRequestDetail): ShowPage {
    cy.visit(paths.admin.placementRequests.show({ placementRequestId: placementRequestDetail.id }))
    return new ShowPage(placementRequestDetail)
  }

  shouldShowSummary(): void {
    this.shouldContainSummaryListItems(placementRequestSummaryList(this.placementRequest).rows)
  }

  shouldNotShowBookingInformation() {
    cy.contains('Booked placement').should('not.exist')
  }

  shouldShowBookingInformation() {
    cy.contains('Booked placement').should('exist')
    this.shouldContainSummaryListItems(placementSummaryList(this.placementRequest).rows)
  }

  clickUnableToMatch() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Mark as unable to match').click()
  }

  shouldShowParoleNotification() {
    cy.get('.govuk-notification-banner').contains('Parole board directed release').should('exist')

    if (this.placementRequest.booking) {
      cy.get('a')
        .contains('change the arrival date')
        .should(
          'have.attr',
          'href',
          managePaths.premises.placements.changes.new({
            premisesId: this.placementRequest.booking.premisesId,
            placementId: this.placementRequest.booking.id,
          }),
        )
    }
  }
}
