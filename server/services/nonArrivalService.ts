import type { NewNonarrival, NonArrivalReason, Nonarrival } from '@approved-premises/api'
import type { BookingClient, ReferenceDataClient, RestClientBuilder } from '../data'

export default class NonarrivalService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

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

  async getReasons(token: string): Promise<Array<NonArrivalReason>> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    return referenceDataClient.getReferenceData('non-arrival-reasons')
  }
}
