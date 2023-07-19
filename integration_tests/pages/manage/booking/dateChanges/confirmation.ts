import type { Booking, FullPerson } from '@approved-premises/api'

import Page from '../../../page'
import paths from '../../../../../server/paths/manage'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export default class DepartureDateChangeConfirmationPage extends Page {
  constructor() {
    super('Departure date updated')
  }

  static visit(premisesId: string, bookingId: string): DepartureDateChangeConfirmationPage {
    cy.visit(paths.bookings.extensions.confirm({ premisesId, bookingId }))
    return new DepartureDateChangeConfirmationPage()
  }

  verifyBookingIsVisible(booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', (booking.person as FullPerson).name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('New departure date', DateFormats.isoDateToUIDate(booking.departureDate))
    })
  }

  verifyNewExpectedDepartureDate(date: string): void {
    cy.get('dl').within(() => {
      this.assertDefinition('New departure date', DateFormats.isoDateToUIDate(date))
    })
  }
}
