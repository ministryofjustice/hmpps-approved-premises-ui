import { GroupedPlacementRequests, PaginatedResponse } from '@approved-premises/ui'
import {
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequest,
  PlacementRequestDetail,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
} from '@approved-premises/api'
import { RestClientBuilder } from '../data'
import PlacementRequestClient from '../data/placementRequestClient'

export default class PlacementRequestService {
  constructor(private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>) {}

  async getAll(token: string): Promise<GroupedPlacementRequests> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    const results = {
      notMatched: [],
      unableToMatch: [],
      matched: [],
    } as GroupedPlacementRequests

    const placementRequests = await placementRequestClient.all()

    placementRequests.forEach(placementRequest => {
      results[placementRequest.status].push(placementRequest)
    })

    return results
  }

  async getDashboard(
    token: string,
    status: PlacementRequestStatus,
    page: number = 1,
    sortBy: PlacementRequestSortField = 'created_at',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<PlacementRequest>> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.dashboard({ status }, page, sortBy, sortDirection)
  }

  async getPlacementRequest(token: string, id: string): Promise<PlacementRequestDetail> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.find(id)
  }

  async createBooking(
    token: string,
    id: string,
    newBooking: NewPlacementRequestBooking,
  ): Promise<NewPlacementRequestBookingConfirmation> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.createBooking(id, newBooking)
  }

  async bookingNotMade(token: string, id: string, body: NewBookingNotMade) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.bookingNotMade(id, body)
  }

  async withdraw(token: string, id: string) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.withdraw(id)
  }
}
