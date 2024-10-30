import type { Booking, Extension, NewDateChange, NewExtension } from '@approved-premises/api'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'

export default class BookingService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async find(token: string, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.find(premisesId, bookingId)
  }

  async findWithoutPremises(token: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.findWithoutPremises(bookingId)
  }

  async listOfBookingsForPremisesId(token: string, premisesId: string): Promise<Array<Booking>> {
    const bookingClient = this.bookingClientFactory(token)
    return bookingClient.allBookingsForPremisesId(premisesId)
  }

  async changeDepartureDate(
    token: string,
    premisesId: string,
    bookingId: string,
    bookingExtension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.extendBooking(premisesId, bookingId, bookingExtension)
  }

  async changeDates(token: string, premisesId: string, bookingId: string, dateChange: NewDateChange): Promise<void> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.changeDates(premisesId, bookingId, dateChange)
  }
}
