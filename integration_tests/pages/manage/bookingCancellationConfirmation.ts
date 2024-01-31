import Page from '../page'

export default class BookingCancellationConfirmPage extends Page {
  constructor() {
    super('Booking withdrawn')
  }

  shouldShowPanel() {
    cy.get('.govuk-panel').should('contain', 'Booking withdrawn')
  }
}
