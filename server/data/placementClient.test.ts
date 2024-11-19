import PlacementClient from './placementClient'
import paths from '../paths/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { cas1AssignKeyWorkerFactory, cas1NonArrivalFactory, newPlacementArrivalFactory } from '../testutils/factories'

describeCas1NamespaceClient('PlacementClient', provider => {
  let placementClient: PlacementClient

  const token = 'SOME_TOKEN'

  const placementId = 'placementId'
  const premisesId = 'premisesId'

  beforeEach(() => {
    placementClient = new PlacementClient(token)
  })

  describe('createArrival', () => {
    it('creates and returns an arrival for a given placement', async () => {
      const newPlacementArrival = newPlacementArrivalFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a lost bed',
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
})
