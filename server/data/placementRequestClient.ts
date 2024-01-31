import {
  ApArea,
  BookingNotMade,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequest,
  PlacementRequestDetail,
  PlacementRequestRequestType,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { PaginatedResponse, PlacementRequestDashboardSearchOptions } from '../@types/ui'
import { normaliseCrn } from '../utils/normaliseCrn'
import { WithdrawPlacementRequestReason } from '../@types/shared/models/WithdrawPlacementRequestReason'

type DashboardQueryParams = DashboardFilters & PlacementRequestDashboardSearchOptions

export type DashboardFilters = {
  status?: PlacementRequestStatus
  requestType?: PlacementRequestRequestType | ''
  apAreaId?: ApArea['id']
}

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

  async dashboard(
    allParams: DashboardQueryParams = {
      status: 'notMatched',
      requestType: '',
      apAreaId: '',
    },
    page = 1,
    sortBy: PlacementRequestSortField = 'created_at',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<PlacementRequest>> {
    const params: DashboardQueryParams = {}

    Object.keys(allParams).forEach(key => {
      if (allParams[key]) {
        params[key] = allParams[key]
      }
    })

    if ('crnOrName' in allParams) {
      params.crnOrName = normaliseCrn(allParams.crnOrName)
    }

    return this.restClient.getPaginatedResponse<PlacementRequest>({
      path: paths.placementRequests.dashboard.pattern,
      page: page.toString(),
      query: { ...params, sortBy, sortDirection },
    })
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

  async withdraw(id: string, reason: WithdrawPlacementRequestReason): Promise<void> {
    await this.restClient.post({
      path: paths.placementRequests.withdrawal.create({ id }),
      data: { reason },
    })
  }
}
