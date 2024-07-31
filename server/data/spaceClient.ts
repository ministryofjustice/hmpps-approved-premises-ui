import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import {
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResults as SpaceSearchResults,
} from '../@types/shared'

export default class SpaceClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('spaceClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(params: SpaceSearchParameters): Promise<SpaceSearchResults> {
    return (await this.restClient.post({
      path: paths.match.findSpaces.pattern,
      data: { ...params },
    })) as Promise<SpaceSearchResults>
  }
}
