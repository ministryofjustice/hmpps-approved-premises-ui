import {
  BookingNotMade,
  Cas1ChangeRequest,
  Cas1ChangeRequestSortField,
  Cas1ChangeRequestSummary,
  Cas1CruManagementArea,
  type Cas1NewChangeRequest,
  Cas1PlacementRequestDetail,
  Cas1RejectChangeRequest,
  NewBookingNotMade,
  NewPlacementRequestBooking,
  NewPlacementRequestBookingConfirmation,
  PlacementRequest,
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
    page = 1,
    sortBy: PlacementRequestSortField = 'created_at',
    sortDirection: SortDirection = 'asc',
  ): Promise<PaginatedResponse<PlacementRequest>> {
    const params: DashboardQueryParams = { ...allParams }

    Object.keys(params).forEach((key: keyof DashboardQueryParams) => {
      if (!params[key]) {
        delete params[key]
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

  async find(id: string): Promise<Cas1PlacementRequestDetail> {
    return (await this.restClient.get({
      path: paths.placementRequests.show({ id }),
    })) as Promise<Cas1PlacementRequestDetail>
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

  async withdraw(id: string, reason: WithdrawPlacementRequestReason): Promise<PlacementRequest> {
    return (await this.restClient.post({
      path: paths.placementRequests.withdrawal.create({ id }),
      data: { reason },
    })) as Promise<PlacementRequest>
  }

  async createPlacementAppeal(id: string, newChangeRequest: Cas1NewChangeRequest) {
    return this.restClient.post({
      path: paths.placementRequests.appeal({ id }),
      data: newChangeRequest,
    })
  }

  async getChangeRequests(
    filterParams: GetChangeRequestsQueryParams = {},
    page: number = 1,
    sortBy: Cas1ChangeRequestSortField = 'name',
    sortDirection: SortDirection = 'asc',
  ) {
    return this.restClient.getPaginatedResponse<Cas1ChangeRequestSummary>({
      path: paths.placementRequests.changeRequests({}),
      page: page.toString(),
      query: { ...filterParams, sortBy, sortDirection },
    })
  }

  async createPlannedTransfer(id: string, newChangeRequest: Cas1NewChangeRequest) {
    return this.restClient.post({
      path: paths.placementRequests.plannedTransfer({ id }),
      data: newChangeRequest,
    })
  }

  async createExtension(id: string, newChangeRequest: Cas1NewChangeRequest) {
    return this.restClient.post({
      path: paths.placementRequests.extension({ id }),
      data: newChangeRequest,
    })
  }

  async getChangeRequest(params: { placementRequestId: string; changeRequestId: string }) {
    return this.restClient.get({
      path: paths.placementRequests.changeRequest(params),
    }) as Promise<Cas1ChangeRequest>
  }

  async rejectChangeRequest(params: {
    placementRequestId: string
    changeRequestId: string
    rejectChangeRequest: Cas1RejectChangeRequest
  }) {
    const { rejectChangeRequest, ...pathParams } = params
    return this.restClient.patch({
      path: paths.placementRequests.changeRequest(pathParams),
      data: rejectChangeRequest,
    }) as Promise<Cas1ChangeRequest>
  }
}
