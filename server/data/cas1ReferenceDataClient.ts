import type { Cas1ReferenceData } from '@approved-premises/ui'
import { Cas1CruManagementArea, Cas1OutOfServiceBedReason } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class Cas1ReferenceDataClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('cas1ReferenceDataClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getReferenceData(type: string): Promise<Array<Cas1ReferenceData>> {
    return (await this.restClient.get({ path: paths.cas1ReferenceData({ type }) })) as Array<Cas1ReferenceData>
  }

  async getCruManagementAreas(): Promise<Array<Cas1CruManagementArea>> {
    return (await this.restClient.get({
      path: paths.cas1ReferenceData({ type: 'cru-management-areas' }),
    })) as Array<Cas1CruManagementArea>
  }

  async getOutOfServiceBedReasons(): Promise<Array<Cas1OutOfServiceBedReason>> {
    return (await this.restClient.get({
      path: paths.cas1ReferenceData({ type: 'out-of-service-bed-reasons' }),
    })) as Array<Cas1OutOfServiceBedReason>
  }
}
