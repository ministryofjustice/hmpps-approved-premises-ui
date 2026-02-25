import {
  BookingNotMade,
  Cas1CruManagementArea,
  Cas1PlacementRequestDetail,
  Cas1PlacementRequestSummary,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequestRequestType,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
  WithdrawPlacementRequestReason,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { PaginatedResponse, PlacementRequestDashboardSearchOptions } from '../@types/ui'
import { normaliseCrn } from '../utils/normaliseCrn'

export type GetChangeRequestsQueryParams = {
  cruManagementAreaId?: string
}

type DashboardQueryParams = DashboardFilters & PlacementRequestDashboardSearchOptions

export type DashboardFilters = {
  status?: PlacementRequestStatus
  requestType?: PlacementRequestRequestType | ''
  cruManagementAreaId?: Cas1CruManagementArea['id']
}

export default class PlacementRequestClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementRequestClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async dashboard(
    allParams: DashboardQueryParams = {
      status: 'notMatched',
      requestType: '',
      cruManagementAreaId: '',
    },
    page: number = 1,
    sortBy?: PlacementRequestSortField,
    sortDirection?: SortDirection,
  ): Promise<PaginatedResponse<Cas1PlacementRequestSummary>> {
    const params: DashboardQueryParams = { ...allParams }

    Object.keys(params).forEach((key: keyof DashboardQueryParams) => {
      if (!params[key]) {
        delete params[key]
      }
    })

    if ('crnOrName' in allParams) {
      params.crnOrName = normaliseCrn(allParams.crnOrName)
    }

    return this.restClient.getPaginatedResponse<Cas1PlacementRequestSummary>({
      path: paths.placementRequests.dashboard.pattern,
      page: page.toString(),
      query: { ...params, sortBy, sortDirection },
    })
  }

  async find(placementRequestId: string) {
    return this.restClient.get<Cas1PlacementRequestDetail>({
      path: paths.placementRequests.show({ placementRequestId }),
    })
  }

  async createBooking(placementRequestId: string, newPlacementRequestBooking: NewPlacementRequestBooking) {
    return this.restClient.post<NewPlacementRequestBookingConfirmation>({
      path: paths.placementRequests.booking({ placementRequestId }),
      data: newPlacementRequestBooking,
    })
  }

  async bookingNotMade(placementRequestId: string, data: NewBookingNotMade) {
    return this.restClient.post<BookingNotMade>({
      path: paths.placementRequests.bookingNotMade({ placementRequestId }),
      data,
    })
  }

  async withdraw(placementRequestId: string, reason: WithdrawPlacementRequestReason) {
    return this.restClient.post<Cas1PlacementRequestDetail>({
      path: paths.placementRequests.withdrawal.create({ placementRequestId }),
      data: { reason },
    })
  }
}
