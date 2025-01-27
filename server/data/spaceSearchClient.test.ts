import SpaceSearchClient from './spaceSearchClient'
import paths from '../paths/api'

import {
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  spaceSearchParametersFactory,
  spaceSearchResultsFactory,
} from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'

describeCas1NamespaceClient('SpaceSearchClient', provider => {
  let spaceSearchClient: SpaceSearchClient

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    spaceSearchClient = new SpaceSearchClient(token)
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

      const result = await spaceSearchClient.search(payload)

      expect(result).toEqual(spaceSearchResult)
    })
  })

  describe('createSpaceBooking', () => {
    it('makes a POST request to the space booking endpoint', async () => {
      const placementRequestId = 'placement-request-id'
      const newSpaceBooking = newSpaceBookingFactory.build()
      const spaceBooking = cas1SpaceBookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a space booking from a placement request',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.spaceBookings.create({ id: placementRequestId }),
          body: newSpaceBooking,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: spaceBooking,
        },
      })

      const result = await spaceSearchClient.createSpaceBooking(placementRequestId, newSpaceBooking)

      expect(result).toEqual(spaceBooking)
    })
  })
})
