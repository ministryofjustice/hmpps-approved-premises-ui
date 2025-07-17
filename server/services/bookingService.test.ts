import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import { bookingFactory } from '../testutils/factories'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const bookingClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory)
  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('findWithoutPremises', () => {
    it('on success returns the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      bookingClient.findWithoutPremises.mockResolvedValue(booking)

      const retrievedBooking = await service.findWithoutPremises(token, booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.findWithoutPremises).toHaveBeenCalledWith(booking.id)
    })
  })
})
