import type { Booking } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

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

  clickMoveBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Move person to a new bed').click()
  }

  shouldShowBookingDetails(booking: Booking): void {
    cy.get('dl[data-cy-crn]').within(() => {
      this.assertDefinition('CRN', booking.person.crn)
    })

    cy.get('dl[data-cy-arrival-information]').within(() => {
      this.assertDefinition('Expected arrival date', DateFormats.isoDateToUIDate(booking.arrival.arrivalDate))
      this.assertDefinition('Arrival date', DateFormats.isoDateToUIDate(booking.arrival.arrivalDate))
      this.assertDefinition('Notes', booking.arrival.notes)
    })

    cy.get('dl[data-cy-departure-information]').within(() => {
      this.assertDefinition('Expected departure date', DateFormats.isoDateToUIDate(booking.departure.dateTime))
      this.assertDefinition('Actual departure date', DateFormats.isoDateToUIDate(booking.departure.dateTime))
      this.assertDefinition('Reason', booking.departure.reason.name)
      this.assertDefinition('Notes', booking.departure.notes)
    })

    cy.get('dl[data-cy-documents]').within(() => {
      this.assertDefinition('Application', 'View document')
      this.assertDefinition('Assessment', 'View document')
    })
  }
}
