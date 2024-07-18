import SpaceClient from './spaceClient'
import paths from '../paths/api'

import { bedSearchParametersFactory, bedSearchResultsFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'

describeClient('SpaceClient', provider => {
  let spaceClient: SpaceClient

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    spaceClient = new SpaceClient(token)
  })

  describe('search', () => {
    it('makes a post request to the beds search endpoint', async () => {
      const bedSearchResult = bedSearchResultsFactory.build()
      const payload = bedSearchParametersFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get details of available spacess matching the crieteria',
        withRequest: {
          method: 'POST',
          path: paths.match.findSpaces.pattern,
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

      const result = await spaceClient.search(payload)

      expect(result).toEqual(bedSearchResult)
    })
  })
})
