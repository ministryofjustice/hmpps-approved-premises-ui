import type { ReferenceData } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import { ApArea, NonArrivalReason, ProbationRegion } from '../@types/shared'
import paths from '../paths/api'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('referenceDataClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReferenceData(type: string): Promise<Array<ReferenceData>> {
    return (await this.restClient.get({ path: paths.referenceData({ type }) })) as Array<ReferenceData>
  }

  async getProbationRegions(): Promise<Array<ProbationRegion>> {
    return (await this.restClient.get({
      path: paths.referenceData({ type: 'probation-regions' }),
    })) as Array<ProbationRegion>
  }

  async getApAreas(): Promise<Array<ApArea>> {
    return (await this.restClient.get({ path: paths.referenceData({ type: 'ap-areas' }) })) as Array<ApArea>
  }

  async getNonArrivalReasons(): Promise<Array<NonArrivalReason>> {
    return (await this.restClient.get({
      path: paths.referenceData({ type: 'non-arrival-reasons' }),
    })) as Array<NonArrivalReason>
  }
}
