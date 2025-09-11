import { PaginatedResponse, PlacementRequestDashboardSearchOptions } from '@approved-premises/ui'
import {
  type Cas1ChangeRequestType,
  type Cas1NewChangeRequest,
  type NamedId,
  Cas1ChangeRequest,
  Cas1ChangeRequestSortField,
  Cas1ChangeRequestSummary,
  Cas1PlacementRequestDetail,
  Cas1RejectChangeRequest,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequestSortField,
  SortDirection,
  WithdrawPlacementRequestReason,
  Cas1PlacementRequestSummary,
} from '@approved-premises/api'

import { type Cas1ReferenceDataClient, RestClientBuilder } from '../data'
import PlacementRequestClient, { DashboardFilters, GetChangeRequestsQueryParams } from '../data/placementRequestClient'

export default class PlacementRequestService {
  constructor(
    private readonly placementRequestClientFactory: RestClientBuilder<PlacementRequestClient>,
    private readonly cas1ReferenceDataClientFactory: RestClientBuilder<Cas1ReferenceDataClient>,
  ) {}

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

  async getChangeRequests(
    token: string,
    filter?: GetChangeRequestsQueryParams,
    page?: number,
    sortBy?: Cas1ChangeRequestSortField,
    sortDirection?: SortDirection,
  ): Promise<PaginatedResponse<Cas1ChangeRequestSummary>> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.getChangeRequests(filter, page, sortBy, sortDirection)
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

  async getChangeRequest(
    token: string,
    params: { placementRequestId: string; changeRequestId: string },
  ): Promise<Cas1ChangeRequest> {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.getChangeRequest(params)
  }

  async getChangeRequestReasons(token: string, changeRequestType: Cas1ChangeRequestType) {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return (await cas1ReferenceDataClient.getReferenceData(
      `change-request-reasons/${changeRequestType}`,
    )) as Array<NamedId>
  }

  async getChangeRequestRejectionReasons(token: string, changeRequestType: Cas1ChangeRequestType) {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return (await cas1ReferenceDataClient.getReferenceData(
      `change-request-rejection-reasons/${changeRequestType}`,
    )) as Array<NamedId>
  }

  async createPlacementAppeal(token: string, id: string, newChangeRequest: Cas1NewChangeRequest) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.createPlacementAppeal(id, newChangeRequest)
  }

  async createPlannedTransfer(token: string, id: string, newChangeRequest: Cas1NewChangeRequest) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.createPlannedTransfer(id, newChangeRequest)
  }

  async createExtension(token: string, id: string, newChangeRequest: Cas1NewChangeRequest) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.createExtension(id, newChangeRequest)
  }

  async rejectChangeRequest(
    token: string,
    params: { placementRequestId: string; changeRequestId: string; rejectChangeRequest: Cas1RejectChangeRequest },
  ) {
    const placementRequestClient = this.placementRequestClientFactory(token)

    return placementRequestClient.rejectChangeRequest(params)
  }
}
