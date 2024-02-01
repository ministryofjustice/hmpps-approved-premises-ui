import type { Booking } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { bookingArrivalRows, bookingDepartureRows, bookingPersonRows } from '../../../../server/utils/bookingUtils'

export default class BookingShowPage extends Page {
  constructor() {
    super('Placement details')
  }

  static visit(premisesId: string, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId, bookingId: booking.id }))
    return new BookingShowPage()
  }

  clickExtendBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Extend placement').click()
  }

  clickWithdrawPlacement() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Withdraw placement').click()
  }

  clickMoveBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Move person to a new bed').click()
  }

  shouldShowBookingDetails(booking: Booking): void {
    cy.get('dl[data-cy-person-info]').within(() => {
      this.shouldContainSummaryListItems(bookingPersonRows(booking))
    })

    cy.get('dl[data-cy-arrival-information]').within(() => {
      this.shouldContainSummaryListItems(bookingArrivalRows(booking))
    })

    cy.get('dl[data-cy-departure-information]').within(() => {
      this.shouldContainSummaryListItems(bookingDepartureRows(booking))
    })
  }
}
