import { Cas1AssignKeyWorker, Cas1NewArrival } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PlacementClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async createArrival(premisesId: string, placementId: string, newPlacementArrival: Cas1NewArrival) {
    return this.restClient.post({
      path: paths.premises.placements.arrival({ premisesId, placementId }),
      data: newPlacementArrival,
    })
  }

  async assignKeyworker(premisesId: string, placementId: string, keyworkerAssignment: Cas1AssignKeyWorker) {
    return this.restClient.post({
      path: paths.premises.placements.keyworker({ premisesId, placementId }),
      data: keyworkerAssignment,
    })
  }
}
