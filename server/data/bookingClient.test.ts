import nock from 'nock'

import {
  bookingFactory,
  cancellationFactory,
  dateChangeFactory,
  departureFactory,
  newBookingFactory,
  newCancellationFactory,
  newDepartureFactory,
  newNonArrivalFactory,
  nonArrivalFactory,
} from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import BookingClient from './bookingClient'

import { DateFormats } from '../utils/dateUtils'
import paths from '../paths/api'

describeClient('BookingClient', provider => {
  let bookingClient: BookingClient

  const token = 'token-1'

  beforeEach(() => {
    bookingClient = new BookingClient(token)
  })

  describe('create', () => {
    it('should return the booking that has been posted', async () => {
      const booking = bookingFactory.build()
      const payload = newBookingFactory.build({
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
        crn: booking.person.crn,
      })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/some-uuid/bookings`,
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.create('some-uuid', payload)

      expect(result).toEqual(booking)
    })
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a booking',
        withRequest: {
          method: 'GET',
          path: `/premises/premisesId/bookings/bookingId`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.find('premisesId', 'bookingId')

      expect(result).toEqual(booking)
    })
  })

  describe('findWithoutPremises', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a booking',
        withRequest: {
          method: 'GET',
          path: paths.bookings.bookingWithoutPremisesPath({ bookingId: 'bookingId' }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.findWithoutPremises('bookingId')

      expect(result).toEqual(booking)
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const bookings = bookingFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all bookings for a premises',
        withRequest: {
          method: 'GET',
          path: `/premises/some-uuid/bookings`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookings,
        },
      })

      const result = await bookingClient.allBookingsForPremisesId('some-uuid')

      expect(result).toEqual(bookings)
    })
  })

  describe('extendBooking', () => {
    it('should return the booking that has been extended', async () => {
      const booking = bookingFactory.build()
      const payload = {
        newDepartureDate: DateFormats.dateObjToIsoDate(new Date(2042, 13, 11)),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to extend a booking',
        withRequest: {
          method: 'POST',
          body: payload,
          path: `/premises/premisesId/bookings/${booking.id}/extensions`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.extendBooking('premisesId', booking.id, payload)

      expect(result).toEqual(booking)
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to cancel a booking',
        withRequest: {
          method: 'POST',
          path: `/premises/premisesId/bookings/bookingId/cancellations`,
          body: newCancellation,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: cancellation,
        },
      })

      const result = await bookingClient.cancel('premisesId', 'bookingId', newCancellation)

      expect(result).toEqual(cancellation)
    })
  })

  describe('markDeparture', () => {
    it('should create a departure', async () => {
      const payload = newDepartureFactory.build()
      const departure = departureFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a booking as not arrived',
        withRequest: {
          method: 'POST',
          path: `/premises/premisesId/bookings/bookingId/departures`,
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: departure,
        },
      })

      const result = await bookingClient.markDeparture('premisesId', 'bookingId', payload)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('markNonArrival', () => {
    it('should create an non-arrival', async () => {
      const nonArrival = nonArrivalFactory.build()
      const payload = newNonArrivalFactory.build({
        date: nonArrival.date.toString(),
        notes: nonArrival.notes,
        reason: nonArrival.reason.id,
      })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a booking as not arrived',
        withRequest: {
          method: 'POST',
          path: `/premises/premisesId/bookings/bookingId/non-arrivals`,
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: nonArrival,
        },
      })

      const result = await bookingClient.markNonArrival('premisesId', 'bookingId', payload)

      expect(result).toEqual(nonArrival)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('moveBooking', () => {
    it('should move a booking', async () => {
      const payload = {
        bedId: 'bedId',
        notes: 'Some notes',
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to move a booking',
        withRequest: {
          method: 'POST',
          path: paths.premises.bookings.move({ premisesId: 'premisesId', bookingId: 'bookingId' }),
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await bookingClient.moveBooking('premisesId', 'bookingId', payload)
    })
  })

  describe('changeDates', () => {
    it('should change dates for a booking', async () => {
      const dateChange = dateChangeFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to move a booking',
        withRequest: {
          method: 'POST',
          path: paths.premises.bookings.dateChange({ premisesId: 'premisesId', bookingId: 'bookingId' }),
          body: dateChange,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await bookingClient.changeDates('premisesId', 'bookingId', dateChange)
    })
  })
})
