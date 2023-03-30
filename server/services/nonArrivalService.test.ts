import NonarrivalService from './nonArrivalService'
import { newNonArrivalFactory, nonArrivalFactory, referenceDataFactory } from '../testutils/factories'
import { BookingClient, ReferenceDataClient } from '../data'

jest.mock('../data')

describe('NonarrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const bookingClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new NonarrivalService(bookingClientFactory, referenceDataClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createNonarrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival = nonArrivalFactory.build()
      const payload = newNonArrivalFactory.build()

      bookingClient.markNonArrival.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival(token, 'premisesID', 'bookingId', payload)

      expect(postedNonArrival).toEqual(nonArrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markNonArrival).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })

  describe('getReasons', () => {
    it('returns an array of reasons', async () => {
      const reasons = referenceDataFactory.buildList(5)
      referenceDataClient.getReferenceData.mockResolvedValue(reasons)

      const result = await service.getReasons(token)

      expect(result).toEqual(reasons)

      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('non-arrival-reasons')
    })
  })
})
