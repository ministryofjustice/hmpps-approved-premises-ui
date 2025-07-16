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

  const service = new CancellationService(ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    BookingClientFactory.mockReturnValue(bookingClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getCancellationReasons', () => {
    it('should return the cancellation reasons', async () => {
      const activeReasons = referenceDataFactory.buildList(2, { isActive: true })
      const inactiveReasons = referenceDataFactory.buildList(2, { isActive: false })

      const cancellationReasons = [...inactiveReasons, ...activeReasons]

      referenceDataClient.getReferenceData.mockResolvedValue(cancellationReasons)

      const result = await service.getCancellationReasons(token)

      expect(result).toEqual(activeReasons)

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('cancellation-reasons')
    })
  })
})
