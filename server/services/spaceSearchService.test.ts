import SpaceSearchClient from '../data/spaceSearchClient'
import {
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
} from '../testutils/factories'
import SpaceSearchService from './spaceSearchService'

jest.mock('../data/spaceSearchClient.ts')

describe('spaceSearchService', () => {
  const spaceSearchClient = new SpaceSearchClient(null) as jest.Mocked<SpaceSearchClient>
  const spaceSearchClientFactory = jest.fn()

  const service = new SpaceSearchService(spaceSearchClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    spaceSearchClientFactory.mockReturnValue(spaceSearchClient)
  })

  describe('search', () => {
    it('calls the all method on the space client', async () => {
      const spaceSearchResults = spaceSearchResultsFactory.build()
      const searchState = spaceSearchStateFactory.build()

      spaceSearchClient.search.mockResolvedValue(spaceSearchResults)

      const result = await service.search(token, searchState)

      expect(result).toEqual(spaceSearchResults)

      expect(spaceSearchClientFactory).toHaveBeenCalledWith(token)
      expect(spaceSearchClient.search).toHaveBeenCalled()
    })
  })

  describe('createSpaceBooking', () => {
    it('should call the client', async () => {
      const newSpaceBooking = newSpaceBookingFactory.build()
      const spaceBooking = cas1SpaceBookingFactory.build()
      spaceSearchClient.createSpaceBooking.mockResolvedValue(spaceBooking)
      const id = 'some-uuid'

      const result = await service.createSpaceBooking(token, id, newSpaceBooking)

      expect(result).toEqual(spaceBooking)
      expect(spaceSearchClientFactory).toHaveBeenCalledWith(token)
      expect(spaceSearchClient.createSpaceBooking).toHaveBeenCalledWith(id, newSpaceBooking)
    })
  })
})
