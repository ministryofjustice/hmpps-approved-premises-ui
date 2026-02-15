import { PaginatedResponse, PlacementRequestDashboardSearchOptions } from '@approved-premises/ui'
import {
  Cas1PlacementRequestDetail,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequestSortField,
  SortDirection,
  WithdrawPlacementRequestReason,
  Cas1PlacementRequestSummary,
} from '@approved-premises/api'

import { type RestClientBuilder } from '../data'
import PlacementRequestClient, { DashboardFilters } from '../data/placementRequestClient'

export default class PlacementRequestService {
  constructor(private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>) {}

  async getDashboard(
    token: string,
    filters: DashboardFilters,
    page?: number,
    sortBy?: PlacementRequestSortField,
    sortDirection?: SortDirection,
  ): Promise<PaginatedResponse<Cas1PlacementRequestSummary>> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.dashboard(filters, page, sortBy, sortDirection)
  }

  async search(
    token: string,
    searchParams: PlacementRequestDashboardSearchOptions,
    page: number = 1,
    sortBy: PlacementRequestSortField = 'created_at',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<Cas1PlacementRequestSummary>> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.dashboard(searchParams, page, sortBy, sortDirection)
  }

  async getPlacementRequest(token: string, id: string): Promise<Cas1PlacementRequestDetail> {
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

  async withdraw(token: string, id: string, reason: WithdrawPlacementRequestReason) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.withdraw(id, reason)
  }
}
