import BedClient from './bedClient'
import paths from '../paths/api'

import bedSearchResultFactory from '../testutils/factories/bedSearchResult'
import describeClient from '../testutils/describeClient'
import bedSearchParametersFactory from '../testutils/factories/bedSearchParameters'

describeClient('BedClient', provider => {
  let bedClient: BedClient

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    bedClient = new BedClient(token)
  })

  describe('search', () => {
    it('makes a post request to the beds search endpoint', async () => {
      const bedSearchResult = bedSearchResultFactory.build()
      const payload = bedSearchParametersFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get details of available beds matching the crieteria',
        withRequest: {
          method: 'POST',
          path: paths.match.findBeds.pattern,
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bedSearchResult,
        },
      })

      const result = await bedClient.search(payload)

      expect(result).toEqual(bedSearchResult)
    })
  })
})
