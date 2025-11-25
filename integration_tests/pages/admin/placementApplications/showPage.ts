import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import Page from '../../page'

import { placementRequestSummaryList } from '../../../../server/utils/placementRequests/placementRequestSummaryList'
import { placementSummaryList } from '../../../../server/utils/placementRequests/placementSummaryList'
import { placementName } from '../../../../server/utils/placements'

import paths from '../../../../server/paths/admin'
import matchPaths from '../../../../server/paths/match'
import applyPaths from '../../../../server/paths/apply'
import managePaths from '../../../../server/paths/manage'
import { changePlacementLink } from '../../../../server/utils/placementRequests/adminIdentityBar'

export default class ShowPage extends Page {
  constructor(private readonly placementRequest: Cas1PlacementRequestDetail) {
    super('Placement request')

    this.actions = {
      'Search for a space': matchPaths.v2Match.placementRequests.search.spaces({
        placementRequestId: placementRequest.id,
      }),
      'Withdraw request for placement': applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
      'Mark as unable to book': matchPaths.placementRequests.bookingNotMade.confirm({
        placementRequestId: placementRequest.id,
      }),
      'Withdraw placement': applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
      'Book placement transfer': matchPaths.v2Match.placementRequests.newPlacement.new({
        placementRequestId: placementRequest.id,
      }),
      'Change placement': changePlacementLink(placementRequest),
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

  shouldShowBookingInformation(bookings: Array<Cas1SpaceBookingSummary>) {
    cy.contains(bookings.length > 1 ? 'Booked placements' : 'Booked placement').should('exist')

    bookings.forEach(booking => {
      cy.get('summary')
        .contains(placementName(booking))
        .closest('details')
        .within(() => {
          this.shouldContainSummaryListItems(placementSummaryList(booking).rows)
          this.shouldShowLink(
            'View placement details',
            managePaths.premises.placements.show({ premisesId: booking.premises.id, placementId: booking.id }),
          )
        })
    })
  }

  clickUnableToMatch() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Mark as unable to book').click()
  }

  shouldShowParoleNotification() {
    cy.get('.govuk-notification-banner').contains('Parole board directed release').should('exist')

    if (this.placementRequest.spaceBookings.length > 0) {
      cy.get('a')
        .contains('change the arrival date')
        .should('have.attr', 'href', changePlacementLink(this.placementRequest))
    }
  }
}
