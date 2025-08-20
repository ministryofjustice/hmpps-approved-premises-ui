import type {
  Cas1BedDetail,
  Cas1CurrentKeyWorker,
  Cas1NationalOccupancy,
  Cas1NationalOccupancyParameters,
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1PremisesBedSummary,
  Cas1PremisesDaySummary,
  Cas1PremisesNewLocalRestriction,
  Cas1SpaceBooking,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  SortDirection,
} from '@approved-premises/api'
import type { PaginatedResponse, PremisesFilters } from '@approved-premises/ui'
import type { Response } from 'express'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async allCas1(filters: PremisesFilters): Promise<Array<Cas1PremisesBasicSummary>> {
    return (await this.restClient.get({
      path: paths.premises.index({}),
      query: { ...filters },
    })) as Array<Cas1PremisesBasicSummary>
  }

  async find(id: string): Promise<Cas1Premises> {
    return (await this.restClient.get({ path: paths.premises.show({ premisesId: id }) })) as Cas1Premises
  }

  async getBeds(premisesId: string): Promise<Array<Cas1PremisesBedSummary>> {
    return (await this.restClient.get({
      path: paths.premises.beds.index({ premisesId }),
    })) as Array<Cas1PremisesBedSummary>
  }

  async getBed(premisesId: string, bedId: string): Promise<Cas1BedDetail> {
    return (await this.restClient.get({ path: paths.premises.beds.show({ premisesId, bedId }) })) as Cas1BedDetail
  }

  async getCapacity(
    premisesId: string,
    startDate: string,
    endDate: string,
    excludeSpaceBookingId?: string,
  ): Promise<Cas1PremiseCapacity> {
    return (await this.restClient.get({
      path: paths.premises.capacity({ premisesId }),
      query: { startDate, endDate, excludeSpaceBookingId },
    })) as Cas1PremiseCapacity
  }

  async getMultipleCapacity(params: Cas1NationalOccupancyParameters): Promise<Cas1NationalOccupancy> {
    return (await this.restClient.post({
      path: paths.premises.nationalCapacity({}),
      data: params,
    })) as Cas1NationalOccupancy
  }

  async getDaySummary(args: {
    premisesId: string
    date: string
    bookingsCriteriaFilter?: Array<Cas1SpaceBookingCharacteristic>
    bookingsSortDirection?: SortDirection
    bookingsSortBy?: Cas1SpaceBookingDaySummarySortField
  }): Promise<Cas1PremisesDaySummary> {
    const { premisesId, date, bookingsSortDirection, bookingsSortBy, bookingsCriteriaFilter } = args
    return (await this.restClient.get({
      path: paths.premises.daySummary({ premisesId, date }),
      query: {
        bookingsSortDirection,
        bookingsSortBy,
        bookingsCriteriaFilter: bookingsCriteriaFilter?.join(','),
      },
    })) as Cas1PremisesDaySummary
  }

  async getPlacements(args: {
    premisesId: string
    status?: string
    crnOrName?: string
    keyWorkerStaffCode?: string
    keyWorkerUserId?: string
    page: number
    perPage: number
    sortBy: Cas1SpaceBookingSummarySortField
    sortDirection: SortDirection
  }): Promise<PaginatedResponse<Cas1SpaceBookingSummary>> {
    const { premisesId, status, crnOrName, keyWorkerStaffCode, keyWorkerUserId, page, perPage, sortBy, sortDirection } =
      args
    return this.restClient.getPaginatedResponse<Cas1SpaceBookingSummary>({
      path: paths.premises.placements.index({ premisesId }),
      page: page.toString(),
      query: { residency: status, crnOrName, keyWorkerStaffCode, keyWorkerUserId, sortBy, sortDirection, perPage },
    })
  }

  async getPlacement(args: { premisesId: string; placementId: string }): Promise<Cas1SpaceBooking> {
    return (await this.restClient.get({
      path: paths.premises.placements.show(args),
    })) as Cas1SpaceBooking
  }

  async getCurrentKeyworkers(premisesId: string): Promise<Array<Cas1CurrentKeyWorker>> {
    return (await this.restClient.get({
      path: paths.premises.currentKeyworkers({ premisesId }),
    })) as Array<Cas1CurrentKeyWorker>
  }

  async getOccupancyReport(response: Response): Promise<void> {
    return this.restClient.pipe(
      {
        path: paths.premises.occupancyReport({}),
        passThroughHeaders: ['content-disposition'],
      },
      response,
    )
  }

  async createLocalRestriction(
    premisesId: string,
    newLocalRestriction: Cas1PremisesNewLocalRestriction,
  ): Promise<unknown> {
    return this.restClient.post({
      path: paths.premises.localRestrictions.create({ premisesId }),
      data: newLocalRestriction,
    })
  }

  async deleteLocalRestriction(premisesId: string, restrictionId: string): Promise<unknown> {
    return this.restClient.delete(paths.premises.localRestrictions.delete({ premisesId, restrictionId }))
  }
}
