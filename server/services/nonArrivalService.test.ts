import NonarrivalService from './nonArrivalService'
import BookingClient from '../data/bookingClient'
import nonArrivalFactory from '../testutils/factories/nonArrival'
import newNonarrivalFactory from '../testutils/factories/newNonArrival'

jest.mock('../data/bookingClient.ts')

describe('NonarrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new NonarrivalService(bookingClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createNonarrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival = nonArrivalFactory.build()
      const payload = newNonarrivalFactory.build()

      bookingClient.markNonArrival.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival(token, 'premisesID', 'bookingId', payload)

      expect(postedNonArrival).toEqual(nonArrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markNonArrival).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })
})
