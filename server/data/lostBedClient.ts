import type {
  LostBed,
  LostBedCancellation,
  NewLostBed,
  NewLostBedCancellation,
  UpdateLostBed,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const response = await this.restClient.post({
      path: paths.premises.lostBeds.create({ premisesId }),
      data: lostBed,
    })

    return response as LostBed
  }

  async find(premisesId: string, id: string): Promise<LostBed> {
    return (await this.restClient.get({ path: paths.premises.lostBeds.show({ premisesId, id }) })) as LostBed
  }

  async get(premisesId: string): Promise<Array<LostBed>> {
    return (await this.restClient.get({ path: paths.premises.lostBeds.index({ premisesId }) })) as Array<LostBed>
  }

  async update(id: string, lostBedData: UpdateLostBed, premisesId: string): Promise<LostBed> {
    const response = await this.restClient.put({
      path: paths.premises.lostBeds.update({ id, premisesId }),
      data: { ...lostBedData },
    })

    return response as LostBed
  }

  async cancel(id: string, premisesId: string, lostBedData: NewLostBedCancellation): Promise<LostBedCancellation> {
    const response = await this.restClient.post({
      path: paths.premises.lostBeds.cancel({ id, premisesId }),
      data: { ...lostBedData },
    })

    return response as LostBedCancellation
  }
}
