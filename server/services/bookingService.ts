import type { Booking } from '@approved-premises/api'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'

export default class BookingService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async findWithoutPremises(token: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    return bookingClient.findWithoutPremises(bookingId)
  }
}
