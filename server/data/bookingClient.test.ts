import { faker } from '@faker-js/faker'
import {
  bookingExtensionFactory,
  bookingFactory,
  cancellationFactory,
  dateChangeFactory,
  newCancellationFactory,
} from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import BookingClient from './bookingClient'

import { DateFormats } from '../utils/dateUtils'
import paths from '../paths/api'

describeClient('BookingClient', provider => {
  let bookingClient: BookingClient

  const token = 'token-1'

  const premisesId = faker.string.uuid()
  const bookingId = faker.string.uuid()

  beforeEach(() => {
    bookingClient = new BookingClient(token)
  })

  describe('find', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a booking',
        withRequest: {
          method: 'GET',
          path: paths.premises.bookings.show({ premisesId, bookingId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.find(premisesId, bookingId)

      expect(result).toEqual(booking)
    })
  })

  describe('findWithoutPremises', () => {
    it('should return the booking that has been requested', async () => {
      const booking = bookingFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a booking',
        withRequest: {
          method: 'GET',
          path: paths.bookings.bookingWithoutPremisesPath({ bookingId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: booking,
        },
      })

      const result = await bookingClient.findWithoutPremises(bookingId)

      expect(result).toEqual(booking)
    })
  })

  describe('allBookingsForPremisesId', () => {
    it('should return all bookings for a given premises ID', async () => {
      const bookings = bookingFactory.buildList(5)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all bookings for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.bookings.index({ premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookings,
        },
      })

      const result = await bookingClient.allBookingsForPremisesId(premisesId)

      expect(result).toEqual(bookings)
    })
  })

  describe('extendBooking', () => {
    it('should return the booking that has been extended', async () => {
      const extension = bookingExtensionFactory.build()
      const payload = {
        newDepartureDate: DateFormats.dateObjToIsoDate(new Date(2042, 13, 11)),
        'newDepartureDate-year': '2042',
        'newDepartureDate-month': '12',
        'newDepartureDate-day': '11',
        notes: 'Some notes',
      }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to extend a booking',
        withRequest: {
          method: 'POST',
          body: payload,
          path: paths.premises.bookings.extensions({ premisesId, bookingId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: extension,
        },
      })

      const result = await bookingClient.extendBooking(premisesId, bookingId, payload)

      expect(result).toEqual(extension)
    })
  })

  describe('cancel', () => {
    it('should create a cancellation', async () => {
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to cancel a booking',
        withRequest: {
          method: 'POST',
          path: paths.premises.bookings.cancellations({ premisesId, bookingId }),
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

      const result = await bookingClient.cancel(premisesId, bookingId, newCancellation)

      expect(result).toEqual(cancellation)
    })
  })

  describe('changeDates', () => {
    it('should change dates for a booking', async () => {
      const dateChange = dateChangeFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to move a booking',
        withRequest: {
          method: 'POST',
          path: paths.premises.bookings.dateChange({ premisesId, bookingId }),
          body: dateChange,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await bookingClient.changeDates(premisesId, bookingId, dateChange)
    })
  })
})
