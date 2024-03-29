import type { Arrival, NewCas1Arrival as NewArrival } from '@approved-premises/api'
import type { BookingClient, RestClientBuilder } from '../data'

export default class ArrivalService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async createArrival(token: string, premisesId: string, bookingId: string, arrival: NewArrival): Promise<Arrival> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedArrival = await bookingClient.markAsArrived(premisesId, bookingId, arrival)

    return confirmedArrival
  }
}
