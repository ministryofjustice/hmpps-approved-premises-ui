import { PlacementRequest } from '../@types/shared'
import PlacementRequestClient from '../data/placementRequestClient'
import placementRequestFactory from '../testutils/factories/placementRequest'
import PlacementRequestService from './placementRequestService'

jest.mock('../data/placementRequestClient.ts')

describe('placementRequestService', () => {
  const placementRequestClient = new PlacementRequestClient(null) as jest.Mocked<PlacementRequestClient>
  const placementRequestClientFactory = jest.fn()

  const service = new PlacementRequestService(placementRequestClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestClientFactory.mockReturnValue(placementRequestClient)
  })

  describe('getAll', () => {
    it('calls the all method on the placementRequest client', async () => {
      const placementRequests: Array<PlacementRequest> = placementRequestFactory.buildList(2)
      placementRequestClient.all.mockResolvedValue(placementRequests)

      const result = await service.getAll(token)

      expect(result).toEqual(placementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.all).toHaveBeenCalled()
    })
  })
})
