import type {
  Cas1AssignKeyWorker,
  Cas1NewArrival,
  Cas1NewDeparture,
  Cas1NewSpaceBookingCancellation,
  Cas1NonArrival,
  Cas1SpaceBooking,
  DepartureReason,
  NonArrivalReason,
} from '@approved-premises/api'
import type { Request } from 'express'
import { DepartureFormSessionData, ReferenceData } from '@approved-premises/ui'
import type { Cas1ReferenceDataClient, RestClientBuilder } from '../data'
import PlacementClient from '../data/placementClient'

export default class PlacementService {
  constructor(
    private readonly placementClientFactory: RestClientBuilder<PlacementClient>,
    private readonly cas1ReferenceDataClientFactory: RestClientBuilder<Cas1ReferenceDataClient>,
  ) {}

  async getPlacement(token: string, placementId: string): Promise<Cas1SpaceBooking> {
    const placementClient = this.placementClientFactory(token)

    return placementClient.getPlacement(placementId)
  }

  async getTimeline(args: { token: string; premisesId: string; placementId: string }) {
    const { token, ...remainingArgs } = args
    const placementClient = this.placementClientFactory(token)
    return placementClient.getTimeline(remainingArgs)
  }

  async createArrival(token: string, premisesId: string, placementId: string, newPlacementArrival: Cas1NewArrival) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.createArrival(premisesId, placementId, newPlacementArrival)
  }

  async assignKeyworker(
    token: string,
    premisesId: string,
    placementId: string,
    keyworkerAssignment: Cas1AssignKeyWorker,
  ) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.assignKeyworker(premisesId, placementId, keyworkerAssignment)
  }

  async getNonArrivalReasons(token: string): Promise<Array<NonArrivalReason>> {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return cas1ReferenceDataClient.getReferenceData('non-arrival-reasons')
  }

  async recordNonArrival(token: string, premisesId: string, placementId: string, nonArrival: Cas1NonArrival) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.recordNonArrival(premisesId, placementId, nonArrival)
  }

  async createDeparture(
    token: string,
    premisesId: string,
    placementId: string,
    newPlacementDeparture: Cas1NewDeparture,
  ) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.createDeparture(premisesId, placementId, newPlacementDeparture)
  }

  async getDepartureReasons(token: string) {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return cas1ReferenceDataClient.getReferenceData('departure-reasons') as Promise<Array<DepartureReason>>
  }

  async getMoveOnCategories(token: string) {
    const cas1ReferenceDataClient = this.cas1ReferenceDataClientFactory(token)

    return cas1ReferenceDataClient.getReferenceData('move-on-categories') as Promise<Array<ReferenceData>>
  }

  getDepartureSessionData(placementId: string, session: Request['session']): DepartureFormSessionData {
    return session?.departureForms?.[placementId]
  }

  setDepartureSessionData(placementId: string, session: Request['session'], data: DepartureFormSessionData) {
    session.departureForms = session.departureForms || {}

    session.departureForms[placementId] = {
      ...this.getDepartureSessionData(placementId, session),
      ...data,
    }
  }

  removeDepartureSessionData(placementId: string, session: Request['session']) {
    delete session?.departureForms?.[placementId]
  }

  async createCancellation(
    token: string,
    premisesId: string,
    placementId: string,
    cancellation: Cas1NewSpaceBookingCancellation,
  ) {
    const placementClient = this.placementClientFactory(token)

    return placementClient.cancel(premisesId, placementId, cancellation)
  }
}
