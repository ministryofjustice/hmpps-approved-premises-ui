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
    return this.restClient.get<Array<ReferenceData>>({ path: paths.referenceData({ type }) })
  }

  async getProbationRegions(): Promise<Array<ProbationRegion>> {
    return this.restClient.get<Array<ProbationRegion>>({
      path: paths.referenceData({ type: 'probation-regions' }),
    })
  }

  async getApAreas(): Promise<Array<ApArea>> {
    return this.restClient.get<Array<ApArea>>({ path: paths.referenceData({ type: 'ap-areas' }) })
  }

  async getNonArrivalReasons(): Promise<Array<NonArrivalReason>> {
    return this.restClient.get<Array<NonArrivalReason>>({
      path: paths.referenceData({ type: 'non-arrival-reasons' }),
    })
  }
}
