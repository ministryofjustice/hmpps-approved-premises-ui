import PlacementService from './placementService'
import PlacementClient from '../data/placementClient'
import { newPlacementArrivalFactory } from '../testutils/factories/newPlacementArrival'

jest.mock('../data/placementClient')

describe('PlacementService', () => {
  const placementClient = new PlacementClient(null) as jest.Mocked<PlacementClient>

  const placementClientFactory = jest.fn()

  const service = new PlacementService(placementClientFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const placementId = 'placementId'

  beforeEach(() => {
    jest.resetAllMocks()
    placementClientFactory.mockReturnValue(placementClient)
  })

  describe('createArrival', () => {
    it('calls the create method of the placement client and returns a response', async () => {
      const newPlacementArrival = newPlacementArrivalFactory.build()

      placementClient.createArrival.mockResolvedValue({})

      const result = await service.createArrival(token, premisesId, placementId, newPlacementArrival)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.createArrival).toHaveBeenCalledWith(premisesId, placementId, newPlacementArrival)
    })
  })
})
