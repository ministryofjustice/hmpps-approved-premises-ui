import type { Premises, NewPremises } from 'temporary-accommodation'
import RestClient from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(data: NewPremises): Promise<Premises> {
    return (await this.restClient.post({ path: paths.temporaryAccommodation.premises.create({}), data })) as Premises
  }
}
