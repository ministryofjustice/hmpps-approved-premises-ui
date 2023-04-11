import { PlacementRequest } from '@approved-premises/api'
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
      const unmatchedPlacementRequests = placementRequestFactory.buildList(4, { status: 'notMatched' })
      const unableToMatchPlacementRequests = placementRequestFactory.buildList(3, { status: 'unableToMatch' })
      const matchedPlacementRequests = placementRequestFactory.buildList(2, { status: 'matched' })

      placementRequestClient.all.mockResolvedValue([
        ...unmatchedPlacementRequests,
        ...unableToMatchPlacementRequests,
        ...matchedPlacementRequests,
      ])

      const result = await service.getAll(token)

      expect(result.matched).toEqual(matchedPlacementRequests)
      expect(result.unableToMatch).toEqual(unableToMatchPlacementRequests)
      expect(result.notMatched).toEqual(unmatchedPlacementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.all).toHaveBeenCalled()
    })
  })

  describe('getPlacementRequest', () => {
    it('calls the find method on the placementRequest client', async () => {
      const placementRequest: PlacementRequest = placementRequestFactory.build()
      placementRequestClient.find.mockResolvedValue(placementRequest)

      const result = await service.getPlacementRequest(token, placementRequest.id)

      expect(result).toEqual(placementRequest)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.find).toHaveBeenCalledWith(placementRequest.id)
    })
  })
})
