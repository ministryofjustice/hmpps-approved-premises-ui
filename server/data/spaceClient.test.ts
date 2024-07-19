import SpaceClient from './spaceClient'
import paths from '../paths/api'

import { spaceSearchParametersFactory, spaceSearchResultsFactory } from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'

describeCas1NamespaceClient('SpaceClient', provider => {
  let spaceClient: SpaceClient

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    spaceClient = new SpaceClient(token)
  })

  describe('search', () => {
    it('makes a post request to the space search endpoint', async () => {
      const spaceSearchResult = spaceSearchResultsFactory.build()
      const payload = spaceSearchParametersFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get details of available spaces matching the crieteria',
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
          body: spaceSearchResult,
        },
      })

      const result = await spaceClient.search(payload)

      expect(result).toEqual(spaceSearchResult)
    })
  })
})
