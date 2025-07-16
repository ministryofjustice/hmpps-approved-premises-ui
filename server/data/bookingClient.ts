import type { Booking } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class BookingClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async findWithoutPremises(bookingId: Booking['id']): Promise<Booking> {
    return (await this.restClient.get({
      path: paths.bookings.bookingWithoutPremisesPath({ bookingId }),
    })) as Booking
  }
}
