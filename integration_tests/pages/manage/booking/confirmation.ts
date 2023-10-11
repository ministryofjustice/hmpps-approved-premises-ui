import type { Booking, FullPerson } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingConfirmationPage extends Page {
  constructor() {
    super('Placement confirmed')
  }

  static visit(premisesId: string, bookingId: string): BookingConfirmationPage {
    cy.visit(paths.bookings.confirm({ premisesId, bookingId }))

    return new BookingConfirmationPage()
  }

  verifyBookingIsVisible(booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', (booking.person as FullPerson).name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Expected arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('Expected departure date', DateFormats.isoDateToUIDate(booking.departureDate))
    })
  }

  clickBackToDashboard(): void {
    cy.get('a').contains('Back to dashboard').click()
  }
}
