/* istanbul ignore file */

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import {
  NewOutOfServiceBed,
  NewOutOfServiceBedCancellation,
  OutOfServiceBed,
  OutOfServiceBedCancellation,
  UpdateOutOfServiceBed,
} from '../@types/ui'
import { Premises } from '../@types/shared'

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

  async get(premisesId: Premises['id']): Promise<Array<OutOfServiceBed>> {
    return (await this.restClient.get({
      path: paths.manage.premises.outOfServiceBeds.index({ premisesId }),
    })) as Array<OutOfServiceBed>
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
