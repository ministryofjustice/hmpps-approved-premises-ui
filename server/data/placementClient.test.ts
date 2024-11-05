import PlacementClient from './placementClient'
import paths from '../paths/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { newPlacementArrivalFactory } from '../testutils/factories/newPlacementArrival'

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
})
