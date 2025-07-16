import { faker } from '@faker-js/faker'
import { bookingFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import BookingClient from './bookingClient'

import paths from '../paths/api'

describeClient('BookingClient', provider => {
  let bookingClient: BookingClient

  const token = 'token-1'

  const bookingId = faker.string.uuid()

  beforeEach(() => {
    bookingClient = new BookingClient(token)
  })

  describe('findWithoutPremises', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a booking',
        withRequest: {
          method: 'GET',
          path: paths.bookings.bookingWithoutPremisesPath({ bookingId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.findWithoutPremises(bookingId)

      expect(result).toEqual(booking)
    })
  })
})
