import type { ReferenceData } from '@approved-premises/ui'
import type { Departure, NewDeparture } from '@approved-premises/api'
import type { BookingClient, ReferenceDataClient, RestClientBuilder } from '../data'

export type DepartureReferenceData = {
  departureReasons: Array<ReferenceData>
  moveOnCategories: Array<ReferenceData>
  destinationProviders: Array<ReferenceData>
}

export default class DepartureService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createDeparture(
    token: string,
    premisesId: string,
    bookingId: string,
    departure: NewDeparture,
  ): Promise<Departure> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedDeparture = await bookingClient.markDeparture(premisesId, bookingId, departure)

    return confirmedDeparture
  }

  async getReferenceData(token: string): Promise<DepartureReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const [departureReasons, moveOnCategories, destinationProviders] = await Promise.all([
      referenceDataClient.getReferenceData('departure-reasons'),
      referenceDataClient.getReferenceData('move-on-categories'),
      referenceDataClient.getReferenceData('destination-providers'),
    ])

    return {
      departureReasons,
      moveOnCategories,
      destinationProviders,
    }
  }
}
