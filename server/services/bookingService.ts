import type { Booking, Extension, NewBedMove, NewBooking, NewDateChange, NewExtension } from '@approved-premises/api'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 365 * 10

  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async create(token: string, premisesId: string, booking: NewBooking): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.create(premisesId, booking)

    return confirmedBooking
  }

  async find(token: string, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
  }

  async findWithoutPremises(token: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.findWithoutPremises(bookingId)

    return booking
  }

  async listOfBookingsForPremisesId(token: string, premisesId: string): Promise<Array<Booking>> {
    const bookingClient = this.bookingClientFactory(token)
    const allBookings = await bookingClient.allBookingsForPremisesId(premisesId)
    return allBookings
  }

  async changeDepartureDate(
    token: string,
    premisesId: string,
    bookingId: string,
    bookingExtension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.extendBooking(premisesId, bookingId, bookingExtension)

    return confirmedBooking
  }

  async moveBooking(token: string, premisesId: string, bookingId: string, move: NewBedMove): Promise<void> {
    const bookingClient = this.bookingClientFactory(token)

    await bookingClient.moveBooking(premisesId, bookingId, move)
  }

  async changeDates(token: string, premisesId: string, bookingId: string, dateChange: NewDateChange): Promise<void> {
    const bookingClient = this.bookingClientFactory(token)

    await bookingClient.changeDates(premisesId, bookingId, dateChange)
  }
}
