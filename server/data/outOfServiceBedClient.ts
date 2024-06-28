/* istanbul ignore file */

import {
  NewCas1OutOfServiceBed as NewOutOfServiceBed,
  NewCas1OutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedCancellation as OutOfServiceBedCancellation,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  Premises,
  SortDirection,
  Temporality,
  UpdateCas1OutOfServiceBed as UpdateOutOfServiceBed,
} from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import superagent from 'superagent'
import { createQueryString } from '../utils/utils'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class OutOfServiceBedClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('outOfServiceBedClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: Premises['id'], outOfServiceBed: NewOutOfServiceBed): Promise<OutOfServiceBed> {
    const response = await this.restClient.post({
      path: paths.manage.premises.outOfServiceBeds.create({ premisesId }),
      data: outOfServiceBed,
    })

    return response as OutOfServiceBed
  }

  async find(premisesId: Premises['id'], id: OutOfServiceBed['id']): Promise<OutOfServiceBed> {
    return (await this.restClient.get({
      path: paths.manage.premises.outOfServiceBeds.show({ premisesId, id }),
    })) as OutOfServiceBed
  }

  async getAllByPremises(premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    return (await this.restClient.get({
      path: paths.manage.premises.outOfServiceBeds.premisesIndex({ premisesId }),
    })) as Array<OutOfServiceBed>
  }

  async get({
    page,
    sortBy,
    sortDirection,
    temporality,
    premisesId,
    apAreaId,
    perPage,
  }: {
    page: number
    temporality: Temporality
    sortBy?: OutOfServiceBedSortField
    sortDirection?: SortDirection
    premisesId?: string
    apAreaId?: string
    perPage?: number
  }): Promise<PaginatedResponse<OutOfServiceBed>> {
    const response = (await this.restClient.get({
      path: paths.manage.outOfServiceBeds.index({}),
      query: createQueryString({ page, sortBy, sortDirection, temporality, premisesId, apAreaId, perPage }),
      raw: true,
    })) as superagent.Response

    return {
      data: response.body,
      pageNumber: page.toString(),
      totalPages: response.headers['x-pagination-totalpages'],
      totalResults: response.headers['x-pagination-totalresults'],
      pageSize: response.headers['x-pagination-pagesize'],
    }
  }

  async update(
    id: OutOfServiceBed['id'],
    outOfServiceBedData: UpdateOutOfServiceBed,
    premisesId: Premises['id'],
  ): Promise<OutOfServiceBed> {
    const response = await this.restClient.put({
      path: paths.manage.premises.outOfServiceBeds.update({ id, premisesId }),
      data: { ...outOfServiceBedData },
    })

    return response as OutOfServiceBed
  }

  async cancel(
    id: string,
    premisesId: Premises['id'],
    outOfServiceBedData: NewOutOfServiceBedCancellation,
  ): Promise<OutOfServiceBedCancellation> {
    const response = await this.restClient.post({
      path: paths.manage.premises.outOfServiceBeds.cancel({ id, premisesId }),
      data: { ...outOfServiceBedData },
    })

    return response as OutOfServiceBedCancellation
  }
}
