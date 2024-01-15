import { SanitisedError } from '../sanitisedError'
import {
  arrivedBookings,
  arrivingTodayOrLate,
  bedsAsSelectItems,
  bookingActions,
  bookingArrivalRows,
  bookingDepartureRows,
  bookingPersonRows,
  bookingShowDocumentRows,
  bookingStatus,
  bookingSummaryList,
  bookingsToTableRows,
  cancellationRows,
  departingTodayOrLate,
  generateConflictBespokeError,
  manageBookingLink,
  nameCell,
  upcomingArrivals,
  upcomingDepartures,
} from './bookingUtils'
import {
  arrivalFactory,
  bedSummaryFactory,
  bookingFactory,
  bookingSummaryFactory,
  cancellationFactory,
  departureFactory,
  personFactory,
  premisesBookingFactory,
  restrictedPersonFactory,
} from '../testutils/factories'
import paths from '../paths/manage'
import assessPaths from '../paths/assess'
import applyPaths from '../paths/apply'
import { DateFormats } from './dateUtils'
import { linebreaksToParagraphs, linkTo } from './utils'
import { BookingStatus, FullPerson } from '../@types/shared'

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
      const booking = bookingFactory.build()
      booking.person = restrictedPersonFactory.build()
      expect(nameCell(booking)).toEqual({
        text: `LAO: ${booking.person.crn}`,
      })
    })

    it('returns the persons name prefixed with "LAO: " if they are a FullPerson but have the isRestricted flag', () => {
      const booking = bookingFactory.build()
      booking.person = personFactory.build({ isRestricted: true })
      expect(nameCell(booking)).toEqual({
        text: `LAO: ${(booking.person as FullPerson).name}`,
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

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'plural', bedId)).toEqual({
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

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'plural', bedId)).toEqual({
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

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'singular', bedId)).toEqual({
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

  describe('bookingStatus', () => {
    const lookup: Record<BookingStatus, string> = {
      arrived: '<strong class="govuk-tag govuk-tag--">Arrived</strong>',
      'awaiting-arrival': '<strong class="govuk-tag govuk-tag--blue">Awaiting arrival</strong>',
      'not-arrived': '<strong class="govuk-tag govuk-tag--red">Not arrived</strong>',
      departed: '<strong class="govuk-tag govuk-tag--pink">Departed</strong>',
      cancelled: '<strong class="govuk-tag govuk-tag--red">Cancelled</strong>',
      provisional: '<strong class="govuk-tag govuk-tag--yellow">Provisional</strong>',
      confirmed: '<strong class="govuk-tag govuk-tag--blue">Confirmed</strong>',
      closed: '<strong class="govuk-tag govuk-tag--red">Closed</strong>',
    }

    Object.keys(lookup).forEach((status: BookingStatus) => {
      it(`Returns the correct status for a '${status}' booking`, () => {
        const booking = bookingFactory.build({ status })
        expect(bookingStatus(booking)).toEqual(lookup[status])
      })
    })
  })

  describe('bookingPersonRows', () => {
    it('returns the correct rows for a person', () => {
      const booking = bookingFactory.build()

      expect(bookingPersonRows(booking)).toEqual([
        {
          key: {
            text: 'Name',
          },
          value: nameCell(booking),
        },
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: booking.person.crn,
          },
        },
        {
          key: {
            text: 'Status',
          },
          value: {
            html: bookingStatus(booking),
          },
        },
      ])
    })
  })

  describe('bookingArrivalRows', () => {
    it('returns the correct rows for a non-arrived booking', () => {
      const booking = bookingFactory.build({ arrival: null })

      expect(bookingArrivalRows(booking)).toEqual([
        {
          key: { text: 'Expected arrival date' },
          value: { text: DateFormats.isoDateToUIDate(booking.arrivalDate) },
        },
      ])
    })

    it('returns the correct rows for an arrived booking', () => {
      const booking = bookingFactory.build({ arrival: arrivalFactory.build() })

      expect(bookingArrivalRows(booking)).toEqual([
        {
          key: { text: 'Actual arrival date' },
          value: { text: DateFormats.isoDateToUIDate(booking.arrival.arrivalDate) },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: linebreaksToParagraphs(booking.arrival.notes),
          },
        },
      ])
    })
  })

  describe('bookingDepartureRows', () => {
    it('returns the correct rows for a non=departed booking', () => {
      const booking = bookingFactory.build({ departure: null })

      expect(bookingDepartureRows(booking)).toEqual([
        {
          key: {
            text: 'Expected departure date',
          },
          value: {
            text: DateFormats.isoDateToUIDate(booking.departureDate),
          },
        },
      ])
    })

    it('returns the correct rows for a departed booking', () => {
      const booking = bookingFactory.build({ departure: departureFactory.build() })

      expect(bookingDepartureRows(booking)).toEqual([
        {
          key: {
            text: 'Actual departure date',
          },
          value: {
            text: DateFormats.isoDateToUIDate(booking.departure.dateTime),
          },
        },
        {
          key: {
            text: 'Reason',
          },
          value: {
            text: booking.departure.reason.name,
          },
        },
        {
          key: {
            text: 'Notes',
          },
          value: {
            html: linebreaksToParagraphs(booking.departure.notes),
          },
        },
      ])
    })
  })

  describe('sorting bookings', () => {
    const bookingsArrivingToday = premisesBookingFactory.arrivingToday().buildList(1)
    const bookingsMarkedAsArrived = premisesBookingFactory.arrivedToday().buildList(1)

    const bookingsDepartingToday = premisesBookingFactory.departingToday().buildList(1)
    const departedBookings = premisesBookingFactory.departedToday().buildList(1)

    const bookingsArrivingSoon = premisesBookingFactory.arrivingSoon().buildList(1)

    const cancelledBookingsWithFutureArrivalDate = premisesBookingFactory.cancelledWithFutureArrivalDate().buildList(1)

    const bookingsDepartingSoon = premisesBookingFactory.departingSoon().buildList(2)

    const bookings = [
      ...bookingsArrivingToday,
      ...bookingsMarkedAsArrived,
      ...bookingsDepartingToday,
      ...departedBookings,
      ...bookingsArrivingSoon,
      ...cancelledBookingsWithFutureArrivalDate,
      ...bookingsDepartingSoon,
    ]

    describe('arrivingTodayOrLate', () => {
      it('returns all bookings arriving today or late', () => {
        expect(arrivingTodayOrLate(bookings, premisesId)).toEqual(
          bookingsToTableRows(bookingsArrivingToday, premisesId, 'arrival'),
        )
      })
    })

    describe('departingTodayOrLate', () => {
      it('returns all bookings departing today or late', () => {
        expect(departingTodayOrLate(bookings, premisesId)).toEqual(
          bookingsToTableRows(bookingsDepartingToday, premisesId, 'departure'),
        )
      })
    })

    describe('upcomingArrivals', () => {
      it('returns all upcoming arrivals', () => {
        expect(upcomingArrivals(bookings, premisesId)).toEqual(
          bookingsToTableRows(bookingsArrivingSoon, premisesId, 'arrival'),
        )
      })
    })

    describe('upcomingDepartures', () => {
      it('returns all upcoming departures', () => {
        expect(upcomingDepartures(bookings, premisesId)).toEqual(
          bookingsToTableRows([...bookingsMarkedAsArrived, ...bookingsDepartingSoon], premisesId, 'departure'),
        )
      })
    })

    describe('arrivedBookings', () => {
      it('returns all arrived bookings', () => {
        expect(arrivedBookings(bookings, premisesId)).toEqual(
          bookingsToTableRows(
            [...bookingsMarkedAsArrived, ...bookingsDepartingToday, ...bookingsDepartingSoon],
            premisesId,
            'departure',
          ),
        )
      })
    })
  })

  describe('cancellationRows', () => {
    it('returns an empty array if there is no cancellation', () => {
      const booking = bookingFactory.build({ cancellation: null })

      expect(cancellationRows(booking)).toEqual([])
    })

    it('returns an details of a cancellations', () => {
      const cancellation = cancellationFactory.build()
      const booking = bookingFactory.build({ cancellation })

      expect(cancellationRows(booking)).toEqual([
        {
          key: {
            text: 'Cancelled on',
          },
          value: {
            text: DateFormats.isoDateToUIDate(cancellation.createdAt),
          },
        },
        {
          key: {
            text: 'Reason',
          },
          value: {
            text: cancellation.reason.name,
          },
        },
      ])
    })
  })
})
