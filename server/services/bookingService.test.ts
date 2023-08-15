import { subDays } from 'date-fns'
import { DateFormats } from '../utils/dateUtils'
import BookingService from './bookingService'
import BookingClient from '../data/bookingClient'

import { bookingExtensionFactory, bookingFactory, dateChangeFactory, newBookingFactory } from '../testutils/factories'
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

  describe('create', () => {
    it('on success returns the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const postedBooking = await service.create(token, 'premisesId', newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.create).toHaveBeenCalledWith('premisesId', newBooking)
    })
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

  describe('bookingsArrivingTodayOrLate', () => {
    it('should return bookings due to arrive today or earlier', async () => {
      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(1)
      const arrivedBookings = bookingFactory.arrivedToday().buildList(1)
      const bookingsArrivingYesterday = bookingFactory.buildList(1, {
        arrivalDate: DateFormats.dateObjToIsoDate(subDays(new Date(), 1)),
      })
      const cancelledBookingsWithFutureArrivalDate = bookingFactory.cancelledWithFutureArrivalDate().buildList(1)
      const today = new Date(new Date().setHours(0, 0, 0, 0))

      const results = service.bookingsArrivingTodayOrLate(
        [
          ...bookingsArrivingToday,
          ...arrivedBookings,
          ...bookingsArrivingYesterday,
          ...cancelledBookingsWithFutureArrivalDate,
        ],
        today,
      )

      expect(results).toEqual([...bookingsArrivingToday, ...bookingsArrivingYesterday])
    })
  })

  describe('bookingsDepartingTodayOrLate', () => {
    it('should return bookings due to depart today or after', async () => {
      const bookingsDepartingToday = bookingFactory.departingToday().buildList(1)
      const departedBookings = bookingFactory.departedToday().buildList(1)
      const bookingsDepartingSoon = bookingFactory.departingSoon().buildList(2)

      const today = new Date(new Date().setHours(0, 0, 0, 0))

      const results = service.bookingsDepartingTodayOrLate(
        [...bookingsDepartingToday, ...departedBookings, ...bookingsDepartingSoon],
        today,
      )

      expect(results).toEqual([...bookingsDepartingToday, ...bookingsDepartingSoon])
    })
  })

  describe('groupedListOfBookingsForPremisesId', () => {
    it('should return table rows of bookings', async () => {
      const today = new Date(new Date().setHours(0, 0, 0, 0))

      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(1)
      const arrivedBookings = bookingFactory.arrivedToday().buildList(1)

      const bookingsDepartingToday = bookingFactory.departingToday().buildList(1)
      const departedBookings = bookingFactory.departedToday().buildList(1)

      const bookingsArrivingSoon = bookingFactory.arrivingSoon().buildList(1)

      const cancelledBookingsWithFutureArrivalDate = bookingFactory.cancelledWithFutureArrivalDate().buildList(1)

      const bookingsDepartingSoon = bookingFactory.departingSoon().buildList(2)

      const bookings = [
        ...bookingsArrivingToday,
        ...arrivedBookings,
        ...bookingsDepartingToday,
        ...departedBookings,
        ...bookingsArrivingSoon,
        ...cancelledBookingsWithFutureArrivalDate,
        ...bookingsDepartingSoon,
      ]

      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue(bookings)

      const results = await service.groupedListOfBookingsForPremisesId(token, 'some-uuid')

      expect(results.arrivingToday).toEqual(service.bookingsArrivingTodayOrLate(bookings, today))
      expect(results.departingToday).toEqual(service.bookingsDepartingTodayOrLate(bookings, today))
      expect(results.upcomingArrivals).toEqual(bookingsArrivingSoon)

      expect(results.upcomingDepartures).toEqual([...arrivedBookings, ...bookingsDepartingSoon])

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

  describe('currentResidents', () => {
    it('should return table rows of the current residents', async () => {
      const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(2)
      const currentResidents = bookingFactory.arrived().buildList(2)

      const premisesId = 'some-uuid'
      bookingClient.allBookingsForPremisesId.mockResolvedValue([...currentResidents, ...bookingsArrivingToday])

      const results = await service.currentResidents(token, 'some-uuid')

      expect(results).toEqual(currentResidents)

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
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
