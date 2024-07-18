import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { ApprovedPremisesBedSearchParameters as BedSearchParameters, BedSearchResults } from '../@types/shared'

export default class SpaceClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('spaceClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(params: BedSearchParameters): Promise<BedSearchResults> {
    return (await this.restClient.post({
      path: `${paths.match.findSpaces.pattern}`,
      data: { ...params, serviceName: 'approved-premises' },
    })) as Promise<BedSearchResults>
  }
}
