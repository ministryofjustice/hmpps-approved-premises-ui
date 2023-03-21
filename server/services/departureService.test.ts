import DepartureService from './departureService'
import BookingClient from '../data/bookingClient'
import ReferenceDataClient from '../data/referenceDataClient'

import departureFactory from '../testutils/factories/departure'
import referenceDataFactory from '../testutils/factories/referenceData'
import newDepartureFactory from '../testutils/factories/newDeparture'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const token = 'SOME_TOKEN'

  const DepartureClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new DepartureService(DepartureClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    DepartureClientFactory.mockReturnValue(bookingClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createDeparture', () => {
    it('on success returns the departure that has been posted', async () => {
      const newDeparture = newDepartureFactory.build()
      const departure = departureFactory.build()

      bookingClient.markDeparture.mockResolvedValue(departure)

      const postedDeparture = await service.createDeparture(token, 'premisesId', 'bookingId', newDeparture)
      expect(postedDeparture).toEqual(departure)

      expect(DepartureClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markDeparture).toHaveBeenCalledWith('premisesId', 'bookingId', newDeparture)
    })
  })

  describe('getReferenceData', () => {
    it('should return the reference data needed to create departures', async () => {
      const departureReasons = referenceDataFactory.buildList(2)
      const moveOnCategories = referenceDataFactory.buildList(3)
      const destinationProviders = referenceDataFactory.buildList(4)

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'departure-reasons': departureReasons,
            'move-on-categories': moveOnCategories,
            'destination-providers': destinationProviders,
          }[category],
        )
      })

      const result = await service.getReferenceData(token)

      expect(result).toEqual({
        departureReasons,
        moveOnCategories,
        destinationProviders,
      })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('departure-reasons')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('move-on-categories')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('destination-providers')
    })
  })
})
