import { bookingFactory, cancellationFactory, dateChangeFactory, newCancellationFactory } from '../testutils/factories'
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
