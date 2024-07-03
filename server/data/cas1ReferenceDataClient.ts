import type { Cas1ReferenceData } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class Cas1ReferenceDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('cas1ReferenceDataClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReferenceData(objectType: string): Promise<Array<Cas1ReferenceData>> {
    return (await this.restClient.get({ path: `/cas1/reference-data/${objectType}` })) as Array<Cas1ReferenceData>
  }
}
