import { SanitisedError } from '../sanitisedError'
import { bookingActions, bookingsToTableRows, generateConflictBespokeError, manageBookingLink } from './bookingUtils'
import { bookingFactory, personFactory } from '../testutils/factories'
import paths from '../paths/manage'
import { DateFormats } from './dateUtils'

describe('bookingUtils', () => {
  const premisesId = 'e8f29a4a-dd4d-40a2-aa58-f3f60245c8fc'

  describe('manageBookingLink', () => {
    it('returns a link for a booking', () => {
      const booking = bookingFactory.build()

      expect(manageBookingLink(premisesId, booking)).toMatchStringIgnoringWhitespace(`<a href="${paths.bookings.show({
        premisesId,
        bookingId: booking.id,
      })}">
      Manage
      <span class="govuk-visually-hidden">
        booking for ${booking.person.crn}
      </span>
    </a>`)
    })
  })

  describe('bookingsToTableRows', () => {
    const bookings = [
      bookingFactory.build({
        person: personFactory.build({ crn: 'ABC123' }),
        arrivalDate: '2022-01-01',
        departureDate: '2022-03-01',
      }),
      bookingFactory.build({
        person: personFactory.build({ crn: 'XYZ345' }),
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-02',
      }),
    ]

    it('casts a group of bookings to table rows with the arrival date', () => {
      expect(bookingsToTableRows(bookings, premisesId, 'arrival')).toEqual([
        [
          {
            text: bookings[0].person.name,
          },
          {
            text: bookings[0].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[0].arrivalDate),
          },
          {
            html: manageBookingLink(premisesId, bookings[0]),
          },
        ],
        [
          {
            text: bookings[1].person.name,
          },
          {
            text: bookings[1].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[1].arrivalDate),
          },
          {
            html: manageBookingLink(premisesId, bookings[1]),
          },
        ],
      ])
    })

    it('casts a group of bookings to table rows with the departure date', () => {
      expect(bookingsToTableRows(bookings, premisesId, 'departure')).toEqual([
        [
          {
            text: bookings[0].person.name,
          },
          {
            text: bookings[0].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[0].departureDate),
          },
          {
            html: manageBookingLink(premisesId, bookings[0]),
          },
        ],
        [
          {
            text: bookings[1].person.name,
          },
          {
            text: bookings[1].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[1].departureDate),
          },
          {
            html: manageBookingLink(premisesId, bookings[1]),
          },
        ],
      ])
    })
  })

  describe('bookingActions', () => {
    it('should return null when the booking is cancelled, departed or did not arrive', () => {
      const cancelledBooking = bookingFactory.cancelledWithFutureArrivalDate().build()
      const departedBooking = bookingFactory.departedToday().build()
      const nonArrivedBooking = bookingFactory.notArrived().build()

      expect(bookingActions(cancelledBooking, 'premisesId')).toEqual(null)
      expect(bookingActions(departedBooking, 'premisesId')).toEqual(null)
      expect(bookingActions(nonArrivedBooking, 'premisesId')).toEqual(null)
    })

    it('should return arrival, non-arrival and cancellation actions if a booking is awaiting arrival', () => {
      const booking = bookingFactory.arrivingToday().build()

      expect(bookingActions(booking, 'premisesId')).toEqual([
        {
          items: [
            {
              text: 'Move person to a new bed',
              classes: 'govuk-button--secondary',
              href: paths.bookings.moves.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Mark as arrived',
              classes: 'govuk-button--secondary',
              href: paths.bookings.arrivals.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Mark as not arrived',
              classes: 'govuk-button--secondary',
              href: paths.bookings.nonArrivals.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Extend placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Cancel placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it('should return a departure action if a booking is arrived', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions(booking, 'premisesId')).toEqual([
        {
          items: [
            {
              text: 'Move person to a new bed',
              classes: 'govuk-button--secondary',
              href: paths.bookings.moves.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Log departure',
              classes: 'govuk-button--secondary',
              href: paths.bookings.departures.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Extend placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
            {
              text: 'Cancel placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId: 'premisesId', bookingId: booking.id }),
            },
          ],
        },
      ])
    })
  })

  describe('generateConflictBespokeError', () => {
    const bookingId = 'bookingId'
    const bedId = 'bedId'
    const lostBedId = 'lostBedId'

    it('generates a bespoke error when there is a conflicting booking', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, bedId, 'plural')).toEqual({
        errorTitle: 'This bedspace is not available for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.bookings.show({
              premisesId,
              bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error when there is a conflicting lost bed', () => {
      const err = {
        data: {
          detail: `Conflicting Lost Bed: ${lostBedId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, bedId, 'plural')).toEqual({
        errorTitle: 'This bedspace is not available for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.lostBeds.show({
              premisesId,
              bedId,
              id: lostBedId,
            })}">existing lost bed</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error for a single date', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, bedId, 'singular')).toEqual({
        errorTitle: 'This bedspace is not available for the date entered',
        errorSummary: [
          {
            html: `It conflicts with an <a href="${paths.bookings.show({
              premisesId,
              bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })
  })
})
