import PlacementRequestClient from '../data/placementRequestClient'
import { placementRequestFactory } from '../testutils/factories'
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
    it('returns grouped placement requests', async () => {
      const unmatchedPlacementRequests = placementRequestFactory.buildList(4, { status: 'not_matched' })
      const unableToMatchPlacementRequests = placementRequestFactory.buildList(3, { status: 'unable_to_match' })
      const matchedPlacementRequests = placementRequestFactory.buildList(2, { status: 'matched' })

      placementRequestClient.all.mockResolvedValue([
        ...unmatchedPlacementRequests,
        ...unableToMatchPlacementRequests,
        ...matchedPlacementRequests,
      ])

      const result = await service.getAll(token)

      expect(result.matched).toEqual(matchedPlacementRequests)
      expect(result.unable_to_match).toEqual(unableToMatchPlacementRequests)
      expect(result.not_matched).toEqual(unmatchedPlacementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.all).toHaveBeenCalled()
    })
  })
})
