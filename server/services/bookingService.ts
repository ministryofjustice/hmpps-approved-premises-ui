import { addDays, isAfter, isBefore, isEqual, isWithinInterval } from 'date-fns'

import type { Booking, Extension, NewBedMove, NewBooking, NewExtension } from '@approved-premises/api'
import type { GroupedListofBookings } from '@approved-premises/ui'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { DateFormats } from '../utils/dateUtils'

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

  async listOfBookingsForPremisesId(token: string, premisesId: string): Promise<Array<Booking>> {
    const bookingClient = this.bookingClientFactory(token)
    const allBookings = await bookingClient.allBookingsForPremisesId(premisesId)
    return allBookings
  }

  async groupedListOfBookingsForPremisesId(token: string, premisesId: string): Promise<GroupedListofBookings> {
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)
    const today = new Date(new Date().setHours(0, 0, 0, 0))

    return {
      arrivingToday: this.bookingsArrivingTodayOrLate(bookings, today),
      departingToday: this.bookingsDepartingTodayOrLate(bookings, today),
      upcomingArrivals: this.upcomingArrivals(bookings, today),
      upcomingDepartures: this.upcomingDepartures(bookings, today),
    }
  }

  async extendBooking(
    token: string,
    premisesId: string,
    bookingId: string,
    bookingExtension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.extendBooking(premisesId, bookingId, bookingExtension)

    return confirmedBooking
  }

  async currentResidents(token: string, premisesId: string): Promise<Array<Booking>> {
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    return this.arrivedBookings(bookings)
  }

  async moveBooking(token: string, premisesId: string, bookingId: string, move: NewBedMove): Promise<void> {
    const bookingClient = this.bookingClientFactory(token)

    await bookingClient.moveBooking(premisesId, bookingId, move)
  }

  bookingsArrivingTodayOrLate(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(
      booking =>
        isEqual(DateFormats.isoToDateObj(booking.arrivalDate), today) ||
        isBefore(DateFormats.isoToDateObj(booking.arrivalDate), today),
    )
  }

  bookingsDepartingTodayOrLate(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(
      booking =>
        isEqual(DateFormats.isoToDateObj(booking.departureDate), today) ||
        isAfter(DateFormats.isoToDateObj(booking.departureDate), today),
    )
  }

  private upcomingArrivals(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking => this.isUpcoming(booking.arrivalDate, today))
  }

  private upcomingDepartures(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking => this.isUpcoming(booking.departureDate, today))
  }

  private arrivedBookings(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'arrived')
  }

  private bookingsAwaitingArrival(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'awaiting-arrival')
  }

  private isUpcoming(date: string, today: Date) {
    return isWithinInterval(DateFormats.isoToDateObj(date), {
      start: addDays(today, 1),
      end: addDays(today, this.UPCOMING_WINDOW_IN_DAYS + 1),
    })
  }
}
