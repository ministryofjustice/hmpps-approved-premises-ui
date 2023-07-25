import {
  BookingNotMade,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequest,
  PlacementRequestDetail,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { createQueryString } from '../utils/utils'

export default class PlacementRequestClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementRequestClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<PlacementRequest>> {
    return (await this.restClient.get({ path: paths.placementRequests.index.pattern })) as Promise<
      Array<PlacementRequest>
    >
  }

  async dashboard(isParole: boolean): Promise<Array<PlacementRequest>> {
    return (await this.restClient.get({
      path: paths.placementRequests.dashboard.pattern,
      query: createQueryString({ isParole }),
    })) as Promise<Array<PlacementRequest>>
  }

  async find(id: string): Promise<PlacementRequestDetail> {
    return (await this.restClient.get({
      path: paths.placementRequests.show({ id }),
    })) as Promise<PlacementRequestDetail>
  }

  async createBooking(
    id: string,
    newPlacementRequestBooking: NewPlacementRequestBooking,
  ): Promise<NewPlacementRequestBookingConfirmation> {
    return (await this.restClient.post({
      path: paths.placementRequests.booking({ id }),
      data: newPlacementRequestBooking,
    })) as Promise<NewPlacementRequestBookingConfirmation>
  }

  async bookingNotMade(id: string, data: NewBookingNotMade): Promise<BookingNotMade> {
    return (await this.restClient.post({
      path: paths.placementRequests.bookingNotMade({ id }),
      data,
    })) as Promise<BookingNotMade>
  }
}
