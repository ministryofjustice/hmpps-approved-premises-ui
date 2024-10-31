import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import { bookingExtensionFactory, bookingFactory, dateChangeFactory } from '../testutils/factories'
import { Booking, NewBedMove } from '../@types/shared'

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

  describe('find', () => {
    it('on success returns the booking that has been requested', async () => {
      const arrivalDate = new Date(2022, 2, 11)
      const departureDate = new Date(2022, 2, 12)

      const booking = bookingFactory.build({
        arrivalDate: arrivalDate.toISOString(),
        departureDate: departureDate.toISOString(),
      })

      bookingClient.find.mockResolvedValue(booking)

      const retrievedBooking = await service.find(token, 'premisesId', booking.id)
      expect(retrievedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.find).toHaveBeenCalledWith('premisesId', booking.id)
    })
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

  describe('listOfBookingsForPremisesId', () => {
    let bookings: Array<Booking>

    beforeAll(() => {
      bookings = bookingFactory.buildList(1)
    })

    it('should return table rows of bookings', async () => {
      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.listOfBookingsForPremisesId(token, premisesId)

      expect(results).toEqual(bookings)

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('extendBooking', () => {
    it('on success returns the booking that has been extended', async () => {
      const booking = bookingExtensionFactory.build()
      bookingClient.extendBooking.mockResolvedValue(booking)
      const newDepartureDateObj = {
        newDepartureDate: new Date(2042, 13, 11).toISOString(),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      const extendedBooking = await service.changeDepartureDate(token, 'premisesId', booking.id, newDepartureDateObj)

      expect(extendedBooking).toEqual(booking)
      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.extendBooking).toHaveBeenCalledWith('premisesId', booking.id, newDepartureDateObj)
    })
  })

  describe('createMoveBooking', () => {
    it('on success returns the arrival that has been posted', async () => {
      const payload: NewBedMove = {
        bedId: 'bedId',
        notes: 'notes',
      }

      await service.moveBooking(token, 'premisesID', 'bookingId', payload)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.moveBooking).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })

  describe('changeDates', () => {
    it('on success returns the arrival that has been posted', async () => {
      const payload = dateChangeFactory.build()

      await service.changeDates(token, 'premisesID', 'bookingId', payload)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.changeDates).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })
})
