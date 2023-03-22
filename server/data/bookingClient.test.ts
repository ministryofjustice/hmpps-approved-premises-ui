import nock from 'nock'

import departureFactory from '../testutils/factories/departure'
import describeClient from '../testutils/describeClient'
import BookingClient from './bookingClient'

import arrivalFactory from '../testutils/factories/arrival'
import newBookingFactory from '../testutils/factories/newBooking'
import bookingFactory from '../testutils/factories/booking'
import cancellationFactory from '../testutils/factories/cancellation'
import newCancellationFactory from '../testutils/factories/newCancellation'
import newDepartureFactory from '../testutils/factories/newDeparture'
import nonArrivalFactory from '../testutils/factories/nonArrival'
import newArrivalFactory from '../testutils/factories/newArrival'
import newNonArrivalFactory from '../testutils/factories/newNonArrival'
import { DateFormats } from '../utils/dateUtils'

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

  describe('markAsArrived', () => {
    it('should create an arrival', async () => {
      const arrival = arrivalFactory.build()
      const payload = newArrivalFactory.build({
        arrivalDate: arrival.arrivalDate.toString(),
        expectedDepartureDate: arrival.expectedDepartureDate.toString(),
        notes: arrival.notes,
      })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to mark a booking as arrived',
        withRequest: {
          method: 'POST',
          path: `/premises/premisesId/bookings/bookingId/arrivals`,
          body: payload,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: arrival,
        },
      })

      const result = await bookingClient.markAsArrived('premisesId', 'bookingId', payload)

      expect(result).toEqual({
        ...arrival,
        arrivalDate: arrival.arrivalDate,
        expectedDepartureDate: arrival.expectedDepartureDate,
      })
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
})
