import BedClient from '../data/bedClient'
import { bedSearchParametersUiFactory, bedSearchResultsFactory } from '../testutils/factories'
import BedService from './bedService'

jest.mock('../data/bedClient.ts')

describe('bedService', () => {
  const bedClient = new BedClient(null) as jest.Mocked<BedClient>
  const bedClientFactory = jest.fn()

  const service = new BedService(bedClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bedClientFactory.mockReturnValue(bedClient)
  })

  describe('search', () => {
    it('calls the all method on the bed client', async () => {
      const bedSearchResults = bedSearchResultsFactory.build()
      const params = bedSearchParametersUiFactory.build()
      bedClient.search.mockResolvedValue(bedSearchResults)

      const result = await service.search(token, params)

      expect(result).toEqual(bedSearchResults)

      expect(bedClientFactory).toHaveBeenCalledWith(token)
      expect(bedClient.search).toHaveBeenCalled()
    })
  })
})
