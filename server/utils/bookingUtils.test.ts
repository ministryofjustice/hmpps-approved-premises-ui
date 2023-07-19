import { SanitisedError } from '../sanitisedError'
import {
  bedsAsSelectItems,
  bookingActions,
  bookingShowDocumentRows,
  bookingSummaryList,
  bookingsToTableRows,
  generateConflictBespokeError,
  manageBookingLink,
  nameCell,
} from './bookingUtils'
import {
  bedSummaryFactory,
  bookingFactory,
  bookingSummaryFactory,
  personFactory,
  restrictedPersonFactory,
} from '../testutils/factories'
import paths from '../paths/manage'
import assessPaths from '../paths/assess'
import applyPaths from '../paths/apply'
import { DateFormats } from './dateUtils'
import { linkTo } from './utils'

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
        bed: undefined,
      }),
      bookingFactory.build({
        person: personFactory.build({ crn: 'XYZ345' }),
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-02',
        bed: {
          name: 'Bed 1',
        },
      }),
    ]

    it('casts a group of bookings to table rows with the arrival date', () => {
      expect(bookingsToTableRows(bookings, premisesId, 'arrival')).toEqual([
        [
          nameCell(bookings[0]),
          {
            text: bookings[0].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[0].arrivalDate),
          },
          {
            text: 'Not allocated',
          },
          {
            html: manageBookingLink(premisesId, bookings[0]),
          },
        ],
        [
          nameCell(bookings[1]),
          {
            text: bookings[1].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[1].arrivalDate),
          },
          {
            text: 'Bed 1',
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
          nameCell(bookings[0]),
          {
            text: bookings[0].person.crn,
          },
          {
            text: DateFormats.isoDateToUIDate(bookings[0].departureDate),
          },
          {
            text: 'Not allocated',
          },
          {
            html: manageBookingLink(premisesId, bookings[0]),
          },
        ],
        [
          nameCell(bookings[1]),
          {
            text: bookings[1].person.crn,
          },

          {
            text: DateFormats.isoDateToUIDate(bookings[1].departureDate),
          },
          {
            text: 'Bed 1',
          },
          {
            html: manageBookingLink(premisesId, bookings[1]),
          },
        ],
      ])
    })
  })

  describe('nameCell', () => {
    it('returns the persons name if they are a full person', () => {
      const fullPerson = personFactory.build()
      expect(nameCell(bookingFactory.build({ person: fullPerson }))).toEqual({ text: fullPerson.name })
    })

    it('returns "Limited access offender" if they are a restricted person', () => {
      const restrictedPerson = restrictedPersonFactory.build()
      expect(nameCell(bookingFactory.build({ person: restrictedPerson }))).toEqual({
        text: `LAO: ${restrictedPerson.crn}`,
      })
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

      expect(bookingActions(booking, premisesId)).toEqual([
        {
          items: [
            {
              text: 'Move person to a new bed',
              classes: 'govuk-button--secondary',
              href: paths.bookings.moves.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Mark as arrived',
              classes: 'govuk-button--secondary',
              href: paths.bookings.arrivals.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Mark as not arrived',
              classes: 'govuk-button--secondary',
              href: paths.bookings.nonArrivals.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Cancel placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Change placement dates',
              classes: 'govuk-button--secondary',
              href: paths.bookings.dateChanges.new({ premisesId, bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it('should return a departure action if a booking is arrived', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions(booking, premisesId)).toEqual([
        {
          items: [
            {
              text: 'Move person to a new bed',
              classes: 'govuk-button--secondary',
              href: paths.bookings.moves.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Log departure',
              classes: 'govuk-button--secondary',
              href: paths.bookings.departures.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Update departure date',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
            },
            {
              text: 'Cancel placement',
              classes: 'govuk-button--secondary',
              href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
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

  describe('bedsAsSelectItems', () => {
    it('should return an array of select items', () => {
      const beds = bedSummaryFactory.buildList(2)

      expect(bedsAsSelectItems(beds, beds[0].id)).toEqual([
        { text: `Bed name: ${beds[0].name}, room name: ${beds[0].roomName}`, value: beds[0].id, selected: true },
        { text: `Bed name: ${beds[1].name}, room name: ${beds[1].roomName}`, value: beds[1].id, selected: false },
      ])
    })
  })

  describe('bookingShowDocumentRows', () => {
    it('should return an array of document rows when the application and assessment are defined', () => {
      const booking = bookingFactory.build()

      expect(bookingShowDocumentRows(booking)).toEqual([
        {
          key: {
            text: 'Application',
          },
          value: {
            html: linkTo(
              applyPaths.applications.show,
              { id: booking.applicationId },
              { text: 'View document', hiddenText: 'View application' },
            ),
          },
        },
        {
          key: {
            text: 'Assessment',
          },
          value: {
            html: linkTo(
              assessPaths.assessments.show,
              { id: booking.assessmentId },
              { text: 'View document', hiddenText: 'View assessment' },
            ),
          },
        },
      ])
    })

    it('should return an empty array if there arent documents attached to the booking', () => {
      const booking = bookingFactory.build({ applicationId: undefined, assessmentId: undefined })

      expect(bookingShowDocumentRows(booking)).toEqual([
        {
          key: {
            text: 'Application',
          },
          value: {
            text: 'No application attached to booking',
          },
        },
        {
          key: {
            text: 'Assessment',
          },
          value: {
            text: 'No assessment attached to booking',
          },
        },
      ])
    })
  })

  describe('bookingSummary', () => {
    it('should return a summarylist of a BookingSummary', () => {
      const createdAt = '2022-01-01'
      const arrivalDate = '2022-03-01'
      const departureDate = '2022-05-01'

      const bookingSummary = bookingSummaryFactory.build({
        createdAt,
        arrivalDate,
        departureDate,
      })

      expect(bookingSummaryList(bookingSummary)).toEqual({
        card: {
          title: {
            text: 'Placement information',
          },
        },
        rows: [
          {
            key: {
              text: 'Approved Premises',
            },
            value: {
              text: bookingSummary.premisesName,
            },
          },
          {
            key: {
              text: 'Date of match',
            },
            value: {
              text: DateFormats.isoDateToUIDate(createdAt),
            },
          },
          {
            key: {
              text: 'Expected arrival date',
            },
            value: {
              text: DateFormats.isoDateToUIDate(arrivalDate),
            },
          },
          {
            key: {
              text: 'Expected departure date',
            },
            value: {
              text: DateFormats.isoDateToUIDate(departureDate),
            },
          },
        ],
      })
    })
  })
})
