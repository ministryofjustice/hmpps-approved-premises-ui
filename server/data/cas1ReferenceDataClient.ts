import type { Cas1ReferenceData } from '@approved-premises/ui'
import { Cas1CruManagementArea } from '@approved-premises/api'
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

  async getCruManagementAreas(): Promise<Array<Cas1CruManagementArea>> {
    return (await this.restClient.get({
      path: `/cas1/reference-data/cru-management-areas`,
    })) as Array<Cas1CruManagementArea>
  }
}
