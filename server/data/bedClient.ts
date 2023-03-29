import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { ApprovedPremisesBedSearchParameters as BedSearchParameters, BedSearchResults } from '../@types/shared'

export default class BedClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bedClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(params: BedSearchParameters): Promise<BedSearchResults> {
    return (await this.restClient.post({
      path: `${paths.match.findBeds.pattern}`,
      data: { ...params },
    })) as Promise<BedSearchResults>
  }
}
