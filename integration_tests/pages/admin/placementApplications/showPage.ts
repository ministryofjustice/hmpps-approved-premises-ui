import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import Page from '../../page'

import { placementRequestSummaryList } from '../../../../server/utils/placementRequests/placementRequestSummaryList'
import paths from '../../../../server/paths/admin'
import { placementSummaryList } from '../../../../server/utils/placementRequests/placementSummaryList'

export default class ShowPage extends Page {
  constructor(private readonly placementRequest: Cas1PlacementRequestDetail) {
    super('Placement request')
  }

  static visit(placementRequestDetail: Cas1PlacementRequestDetail): ShowPage {
    cy.visit(paths.admin.placementRequests.show({ id: placementRequestDetail.id }))
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
  }
}
