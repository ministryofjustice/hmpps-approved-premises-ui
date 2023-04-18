import { BedSearchParametersUi } from '../@types/ui'
import BedClient from '../data/bedClient'
import { bedSearchParametersFactory, bedSearchResultsFactory } from '../testutils/factories'
import { mapApiParamsForUi } from '../utils/matchUtils'
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
      const params = bedSearchParametersFactory.onCreate(mapApiParamsForUi).build() as unknown as BedSearchParametersUi
      bedClient.search.mockResolvedValue(bedSearchResults)

      const result = await service.search(token, params)

      expect(result).toEqual(bedSearchResults)

      expect(bedClientFactory).toHaveBeenCalledWith(token)
      expect(bedClient.search).toHaveBeenCalled()
    })
  })
})
