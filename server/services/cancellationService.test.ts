import CancellationService from './cancellationService'
import BookingClient from '../data/bookingClient'
import ReferenceDataClient from '../data/referenceDataClient'

import { cancellationFactory, newCancellationFactory, referenceDataFactory } from '../testutils/factories'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const BookingClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const token = 'SOME_TOKEN'

  const service = new CancellationService(BookingClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    BookingClientFactory.mockReturnValue(bookingClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createCancellation', () => {
    it('on success returns the cancellation that has been posted', async () => {
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      bookingClient.cancel.mockResolvedValue(cancellation)

      const postedDeparture = await service.createCancellation(token, 'premisesId', 'bookingId', newCancellation)
      expect(postedDeparture).toEqual(cancellation)

      expect(BookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.cancel).toHaveBeenCalledWith('premisesId', 'bookingId', newCancellation)
    })
  })

  describe('getCancellationReasons', () => {
    it('should return the cancellation reasons', async () => {
      const cancellationReasons = referenceDataFactory.buildList(2)

      referenceDataClient.getReferenceData.mockResolvedValue(cancellationReasons)

      const result = await service.getCancellationReasons(token)

      expect(result).toEqual(cancellationReasons)

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('cancellation-reasons')
    })
  })
})
