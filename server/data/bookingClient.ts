import type {
  Booking,
  Cancellation,
  Extension,
  NewCancellation,
  NewDateChange,
  NewExtension,
  Premises,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class BookingClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(premisesId: Premises['id'], bookingId: Booking['id']): Promise<Booking> {
    return (await this.restClient.get({ path: this.bookingPath(premisesId, bookingId) })) as Booking
  }

  async findWithoutPremises(bookingId: Booking['id']): Promise<Booking> {
    return (await this.restClient.get({
      path: paths.bookings.bookingWithoutPremisesPath({ bookingId }),
    })) as Booking
  }

  async allBookingsForPremisesId(premisesId: string): Promise<Array<Booking>> {
    return (await this.restClient.get({ path: this.bookingsPath(premisesId) })) as Array<Booking>
  }

  async extendBooking(premisesId: string, bookingId: string, bookingExtension: NewExtension): Promise<Extension> {
    return (await this.restClient.post({
      path: `/premises/${premisesId}/bookings/${bookingId}/extensions`,
      data: bookingExtension,
    })) as Extension
  }

  async cancel(premisesId: string, bookingId: string, cancellation: NewCancellation): Promise<Cancellation> {
    const response = await this.restClient.post({
      path: `${this.bookingPath(premisesId, bookingId)}/cancellations`,
      data: cancellation,
    })

    return response as Cancellation
  }

  async changeDates(premisesId: string, bookingId: string, dateChange: NewDateChange): Promise<void> {
    await this.restClient.post({
      path: paths.premises.bookings.dateChange({ premisesId, bookingId }),
      data: dateChange,
    })
  }

  private bookingsPath(premisesId: string): string {
    return `/premises/${premisesId}/bookings`
  }

  private bookingPath(premisesId: string, bookingId: string): string {
    return [this.bookingsPath(premisesId), bookingId].join('/')
  }
}
