import type { NewNonarrival, Nonarrival } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'

export default class NonarrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createNonArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: NewNonarrival,
  ): Promise<Nonarrival> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedNonArrival = await bookingClient.markNonArrival(premisesId, bookingId, arrival)

    return confirmedNonArrival
  }
}
