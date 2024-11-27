import SpaceClient from './spaceClient'
import paths from '../paths/api'

import {
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  spaceSearchParametersFactory,
  spaceSearchResultsFactory,
} from '../testutils/factories'
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

      const result = await spaceClient.createSpaceBooking(placementRequestId, newSpaceBooking)

      expect(result).toEqual(spaceBooking)
    })
  })
})
