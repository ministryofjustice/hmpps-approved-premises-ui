import type {
  Cas1AssignKeyWorker,
  Cas1NewArrival,
  Cas1NewDeparture,
  Cas1NewSpaceBookingCancellation,
  Cas1NonArrival,
  Cas1SpaceBooking,
  TimelineEvent,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PlacementClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getPlacement(placementId: string): Promise<Cas1SpaceBooking> {
    return (await this.restClient.get({
      path: paths.placements.placementWithoutPremises({ placementId }),
    })) as Cas1SpaceBooking
  }

  async getTimeline(args: { premisesId: string; placementId: string }): Promise<Array<TimelineEvent>> {
    return (await this.restClient.get({
      path: paths.premises.placements.timeline(args),
    })) as Array<TimelineEvent>
  }

  async createArrival(premisesId: string, placementId: string, newPlacementArrival: Cas1NewArrival): Promise<unknown> {
    return this.restClient.post({
      path: paths.premises.placements.arrival({ premisesId, placementId }),
      data: newPlacementArrival,
    })
  }

  async recordNonArrival(premisesId: string, placementId: string, nonArrival: Cas1NonArrival) {
    return this.restClient.post({
      path: paths.premises.placements.nonArrival({ premisesId, placementId }),
      data: nonArrival,
    })
  }

  async assignKeyworker(premisesId: string, placementId: string, keyworkerAssignment: Cas1AssignKeyWorker) {
    return this.restClient.post({
      path: paths.premises.placements.keyworker({ premisesId, placementId }),
      data: keyworkerAssignment,
    })
  }

  async createDeparture(
    premisesId: string,
    placementId: string,
    newPlacementDeparture: Cas1NewDeparture,
  ): Promise<unknown> {
    return this.restClient.post({
      path: paths.premises.placements.departure({ premisesId, placementId }),
      data: newPlacementDeparture,
    })
  }

  async cancel(premisesId: string, placementId: string, cancellation: Cas1NewSpaceBookingCancellation) {
    return this.restClient.post({
      path: paths.premises.placements.cancel({ premisesId, placementId }),
      data: cancellation,
    })
  }
}
