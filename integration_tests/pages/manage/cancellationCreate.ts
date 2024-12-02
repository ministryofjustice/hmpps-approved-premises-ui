import type { NewCancellation } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'
import applyPaths from '../../../server/paths/apply'
import { otherCancellationReasonId } from '../../../server/testutils/factories/newCancellation'

export default class CancellationCreatePage extends Page {
  constructor(
    public readonly premisesId: string,
    public readonly bookingId: string,
    public readonly spaceBookingId: string,
  ) {
    super('Confirm withdrawn placement')
  }

  static visit(premisesId: string, bookingId: string): CancellationCreatePage {
    cy.visit(paths.bookings.cancellations.new({ premisesId, bookingId }))

    return new CancellationCreatePage(premisesId, bookingId, undefined)
  }

  static visitWithSpaceBooking(premisesId: string, placementId: string): CancellationCreatePage {
    cy.visit(paths.premises.placements.cancellations.new({ premisesId, placementId }))

    return new CancellationCreatePage(premisesId, undefined, placementId)
  }

  completeForm(cancellation: NewCancellation): void {
    this.getLegend('Why is this placement being withdrawn?')
    this.checkRadioByNameAndValue('cancellation[reason]', cancellation.reason)

    if (cancellation.reason === otherCancellationReasonId && cancellation.otherReason) {
      this.completeTextArea('cancellation[otherReason]', cancellation.otherReason)
    }

    this.clickSubmit()
  }

  shouldShowBacklinkToSpaceBooking(): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', paths.bookings.show({ premisesId: this.premisesId, bookingId: this.spaceBookingId }))
  }

  shouldShowBacklinkToBooking(): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', paths.bookings.show({ premisesId: this.premisesId, bookingId: this.bookingId }))
  }

  shouldShowBackLinkToApplicationWithdraw(applicationId: string): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', applyPaths.applications.withdrawables.show({ id: applicationId }))
  }
}
