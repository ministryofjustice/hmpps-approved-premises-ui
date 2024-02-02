import type { Cancellation } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'
import applyPaths from '../../../server/paths/apply'

export default class CancellationCreatePage extends Page {
  constructor(
    public readonly premisesId: string,
    public readonly bookingId: string,
  ) {
    super('Confirm withdrawn booking')
  }

  static visit(premisesId: string, bookingId: string): CancellationCreatePage {
    cy.visit(paths.bookings.cancellations.new({ premisesId, bookingId }))

    return new CancellationCreatePage(premisesId, bookingId)
  }

  completeForm(cancellation: Cancellation, { completeFullForm }: { completeFullForm: boolean }): void {
    if (completeFullForm) {
      this.getLegend('What is the date of withdrawal?')
      this.completeDateInputs('date', cancellation.date)
      this.getLabel('Provide any additional notes on why this booking is being withdrawn')
      this.completeTextArea('cancellation[notes]', cancellation.notes)
    }

    this.getLegend('Why is this booking being withdrawn?')
    this.checkRadioByNameAndValue('cancellation[reason]', cancellation.reason.id)

    this.clickSubmit()
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
