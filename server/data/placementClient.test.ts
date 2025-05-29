import type { Cas1SpaceBooking, Cas1TimelineEvent } from '@approved-premises/api'
import PlacementClient from './placementClient'
import paths from '../paths/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import {
  cas1AssignKeyWorkerFactory,
  cas1NewArrivalFactory,
  cas1NewDepartureFactory,
  cas1NewEmergencyTransferFactory,
  cas1NewSpaceBookingCancellationFactory,
  cas1NonArrivalFactory,
  cas1SpaceBookingFactory,
  cas1TimelineEventFactory,
  cas1UpdateSpaceBookingFactory,
} from '../testutils/factories'

const token = 'TEST_TOKEN'

describeCas1NamespaceClient('PlacementClient', provider => {
  let placementClient: PlacementClient
  const placementId = 'placementId'
  const premisesId = 'premisesId'

  beforeEach(() => {
    placementClient = new PlacementClient(token)
  })

  describe('getPlacement', () => {
    it('gets the details for a placement by id', async () => {
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for placement details',
        withRequest: {
          method: 'GET',
          path: paths.placements.placementWithoutPremises({ placementId: placement.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placement,
        },
      })
      const result = await placementClient.getPlacement(placement.id)

      expect(result).toEqual(placement)
    })
  })

  describe('getTimeline', () => {
    it('gets the timeline for a placement', async () => {
      const timeLine: Array<Cas1TimelineEvent> = cas1TimelineEventFactory.buildList(10)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for placement timeline',
        withRequest: {
          method: 'GET',
          path: paths.premises.placements.timeline({ placementId, premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: timeLine,
        },
      })
      const result = await placementClient.getTimeline({ premisesId, placementId })
      expect(result).toEqual(timeLine)
    })
  })

  describe('updatePlacement', () => {
    it('patches a placement and returns it', async () => {
      const updatePlacement = cas1UpdateSpaceBookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a placement',
        withRequest: {
          method: 'PATCH',
          path: paths.premises.placements.show({ premisesId, placementId }),
          body: updatePlacement,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await placementClient.updatePlacement(premisesId, placementId, updatePlacement)

      expect(result).toEqual({})
    })
  })

  describe('createArrival', () => {
    it('creates and returns an arrival for a given placement', async () => {
      const newPlacementArrival = cas1NewArrivalFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to record a placement arrival',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.arrival({ premisesId, placementId }),
          body: newPlacementArrival,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await placementClient.createArrival(premisesId, placementId, newPlacementArrival)

      expect(result).toEqual({})
    })
  })

  describe('assignKeyworker', () => {
    it('assigns a keyworker to a given placement', async () => {
      const keyworkerAssignment = cas1AssignKeyWorkerFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to assign a keyworker to a placement',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.keyworker({ premisesId, placementId }),
          body: keyworkerAssignment,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await placementClient.assignKeyworker(premisesId, placementId, keyworkerAssignment)

      expect(result).toEqual({})
    })
  })

  describe('recordNonArrival', () => {
    it('records a non-arrival against a given placement', async () => {
      const nonArrival = cas1NonArrivalFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to record a non-arrival',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.nonArrival({ premisesId, placementId }),
          body: nonArrival,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await placementClient.recordNonArrival(premisesId, placementId, nonArrival)

      expect(result).toEqual({})
    })
  })

  describe('createDeparture', () => {
    it('creates a departure for a given placement', async () => {
      const newPlacementDeparture = cas1NewDepartureFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to record a placement departure',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.departure({ premisesId, placementId }),
          body: newPlacementDeparture,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementClient.createDeparture(premisesId, placementId, newPlacementDeparture)
      expect(result).toEqual({})
    })
  })

  describe('createCancellation', () => {
    it('cancels the given placement', async () => {
      const cancellation = cas1NewSpaceBookingCancellationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to cancel a placement',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.cancel({ premisesId, placementId }),
          body: cancellation,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementClient.cancel(premisesId, placementId, cancellation)
      expect(result).toEqual({})
    })
  })

  describe('createEmergencyTransfer', () => {
    it('creates an emergency transfer', async () => {
      const newEmergencyTransfer = cas1NewEmergencyTransferFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create an emergency transfer',
        withRequest: {
          method: 'POST',
          path: paths.premises.placements.emergencyTransfer({ premisesId, placementId }),
          body: newEmergencyTransfer,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })
      const result = await placementClient.createEmergencyTransfer(premisesId, placementId, newEmergencyTransfer)
      expect(result).toEqual({})
    })
  })
})
