import PlacementRequestClient from './placementRequestClient'
import paths from '../paths/api'

import {
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
  placementRequestFactory,
} from '../testutils/factories'
import describeClient from '../testutils/describeClient'

describeClient('placementRequestClient', provider => {
  let placementRequestClient: PlacementRequestClient

  const token = 'token-1'

  beforeEach(() => {
    placementRequestClient = new PlacementRequestClient(token)
  })

  describe('all', () => {
    it('makes a get request to the placementRequests endpoint', async () => {
      const placementRequests = placementRequestFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all placement requests',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.index.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequests,
        },
      })

      const result = await placementRequestClient.all()

      expect(result).toEqual(placementRequests)
    })
  })

  describe('find', () => {
    it('makes a get request to the placementRequest endpoint', async () => {
      const placementRequest = placementRequestFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a placement request',
        withRequest: {
          method: 'GET',
          path: paths.placementRequests.show({ id: placementRequest.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementRequest,
        },
      })

      const result = await placementRequestClient.find(placementRequest.id)

      expect(result).toEqual(placementRequest)
    })
  })

  describe('createBooking', () => {
    it('creates and returns a booking', async () => {
      const placementRequest = placementRequestFactory.build()
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()
      const newPlacementRequestBooking = newPlacementRequestBookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a booking from a placement request',
        withRequest: {
          method: 'POST',
          path: paths.placementRequests.booking({ id: placementRequest.id }),
          body: newPlacementRequestBooking,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookingConfirmation,
        },
      })

      const result = await placementRequestClient.createBooking(placementRequest.id, newPlacementRequestBooking)

      expect(result).toEqual(bookingConfirmation)
    })
  })
})
