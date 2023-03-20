import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { PlacementRequest } from '../@types/shared'

export default class PlacementRequestClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementRequestClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<PlacementRequest>> {
    return (await this.restClient.get({ path: paths.placementRequests.index.pattern })) as Promise<
      Array<PlacementRequest>
    >
  }
}
