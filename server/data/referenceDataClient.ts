import type { ReferenceData } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import { ApArea, ProbationRegion } from '../@types/shared'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReferenceData(objectType: string): Promise<Array<ReferenceData>> {
    return (await this.restClient.get({ path: `/reference-data/${objectType}` })) as Array<ReferenceData>
  }

  async getProbationRegions(): Promise<Array<ProbationRegion>> {
    return (await this.restClient.get({ path: `/reference-data/probation-regions` })) as Array<ProbationRegion>
  }

  async getApAreas(): Promise<Array<ApArea>> {
    return (await this.restClient.get({ path: `/reference-data/ap-areas` })) as Array<ApArea>
  }
}
