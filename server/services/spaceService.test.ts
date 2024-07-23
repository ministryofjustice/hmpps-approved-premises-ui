import SpaceClient from '../data/spaceClient'
import { spaceSearchParametersUiFactory, spaceSearchResultsFactory } from '../testutils/factories'
import SpaceService from './spaceService'

jest.mock('../data/spaceClient.ts')

describe('spaceService', () => {
  const spaceClient = new SpaceClient(null) as jest.Mocked<SpaceClient>
  const spaceClientFactory = jest.fn()

  const service = new SpaceService(spaceClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    spaceClientFactory.mockReturnValue(spaceClient)
  })

  describe('search', () => {
    it('calls the all method on the space client', async () => {
      const spaceSearchResults = spaceSearchResultsFactory.build()
      const params = spaceSearchParametersUiFactory.build()
      spaceClient.search.mockResolvedValue(spaceSearchResults)

      const result = await service.search(token, params)

      expect(result).toEqual(spaceSearchResults)

      expect(spaceClientFactory).toHaveBeenCalledWith(token)
      expect(spaceClient.search).toHaveBeenCalled()
    })
  })
})
