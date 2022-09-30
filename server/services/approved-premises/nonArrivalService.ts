import type { NonArrival } from 'approved-premises'
import { RestClientBuilder } from '../../data'
import type { BookingClient } from '../../data/approved-premises'

export default class NonArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createNonArrival(
    token: string,
    premisesId: string,
    bookingId: string,
    arrival: Omit<NonArrival, 'id' | 'bookingId'>,
  ): Promise<NonArrival> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedNonArrival = await bookingClient.markNonArrival(premisesId, bookingId, arrival)

    return confirmedNonArrival
  }
}
