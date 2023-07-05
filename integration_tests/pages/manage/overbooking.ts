import { BedOccupancyBookingEntryUi, BedOccupancyLostBedEntryUi } from '@approved-premises/ui'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class OverbookingPage extends Page {
  constructor() {
    super('Manage Overbookings')
  }

  shouldShowDetailOfBooking(booking: BedOccupancyBookingEntryUi) {
    cy.get(`[data-cy-bookingId="${booking.bookingId}"]`).within(() => {
      this.assertDefinition('Arrival Date', DateFormats.isoDateToUIDate(booking.startDate as unknown as string))
      this.assertDefinition('Departure Date', DateFormats.isoDateToUIDate(booking.endDate as unknown as string))
    })
  }

  shouldShowDetailOfLostBed(booking: BedOccupancyLostBedEntryUi) {
    cy.get(`[data-cy-lostBedId="${booking.lostBedId}"]`).within(() => {
      this.assertDefinition('Arrival Date', DateFormats.isoDateToUIDate(booking.startDate as unknown as string))
      this.assertDefinition('Departure Date', DateFormats.isoDateToUIDate(booking.endDate as unknown as string))
    })
  }
}
