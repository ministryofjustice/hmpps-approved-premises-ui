import { SanitisedError } from '../../sanitisedError'
import {
  BookingStatusTag,
  bookingArrivalRows,
  bookingDepartureRows,
  bookingPersonRows,
  bookingShowDocumentRows,
  cancellationReasonsRadioItems,
  cancellationRows,
  generateConflictBespokeError,
} from '.'
import {
  arrivalFactory,
  bookingFactory,
  cancellationFactory,
  cancellationReasonFactory,
  departureFactory,
} from '../../testutils/factories'
import paths from '../../paths/manage'
import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'
import { DateFormats } from '../dateUtils'
import { linebreaksToParagraphs, linkTo } from '../utils'
import { BookingStatus } from '../../@types/shared'
import { displayName } from '../personUtils'

describe('bookingUtils', () => {
  const premisesId = 'e8f29a4a-dd4d-40a2-aa58-f3f60245c8fc'

  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('generateConflictBespokeError', () => {
    const bookingId = 'booking-id'
    const bedId = 'bed-id'
    const lostBedId = 'lost-bed-id'

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

    it('generates a bespoke error when there is a conflicting out-of-service bed', () => {
      const err = {
        data: {
          detail: `An out-of-service bed already exists for dates from 2024-10-05 to 2024-10-20 which overlaps with the desired dates: ${lostBedId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'plural', bedId)).toEqual({
        errorTitle: 'Out of service bed record cannot be created for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.outOfServiceBeds.show({
              premisesId,
              bedId,
              id: lostBedId,
              tab: 'details',
            })}">existing out of service beds record</a>`,
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

  describe('bookingShowDocumentRows', () => {
    it('should return an array of document rows when the application and assessment are defined', () => {
      const booking = bookingFactory.build()

      expect(bookingShowDocumentRows(booking)).toEqual([
        {
          key: {
            text: 'Application',
          },
          value: {
            html: linkTo(applyPaths.applications.show({ id: booking.applicationId }), {
              text: 'View document',
              hiddenText: 'View application',
            }),
          },
        },
        {
          key: {
            text: 'Assessment',
          },
          value: {
            html: linkTo(assessPaths.assessments.show({ id: booking.assessmentId }), {
              text: 'View document',
              hiddenText: 'View assessment',
            }),
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

  describe('bookingPersonRows', () => {
    it('returns the correct rows for a person', () => {
      const booking = bookingFactory.build()

      expect(bookingPersonRows(booking)).toEqual([
        {
          key: {
            text: 'Name',
          },
          value: {
            text: displayName(booking.person),
          },
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
            html: new BookingStatusTag(booking.status).html(),
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

  describe('cancellationRows', () => {
    it('returns an empty array if there is no cancellation', () => {
      const booking = bookingFactory.build({ cancellation: null })

      expect(cancellationRows(booking)).toEqual([])
    })

    it('returns an details of a cancellations', () => {
      const cancellationReason = cancellationReasonFactory.build({ name: 'Recall' })
      const cancellation = cancellationFactory.build({ reason: cancellationReason })
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

    it('returns an details of a cancellations for other reason', () => {
      const cancellationReason = cancellationReasonFactory.build({ name: 'Other' })
      const cancellation = cancellationFactory.build({ reason: cancellationReason })
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
            text: `${booking.cancellation.reason.name} - ${booking.cancellation.otherReason}`,
          },
        },
      ])
    })
  })

  describe('cancellationReasonRadioItems', () => {
    const objects = [
      {
        id: '123',
        name: 'Other',
      },
      {
        id: '345',
        name: 'foo',
      },
    ]

    it('converts objects to an array of radio items', () => {
      const result = cancellationReasonsRadioItems(objects, 'somehtml', {})

      expect(result).toEqual([
        {
          text: 'Other',
          value: '123',
          checked: false,
          conditional: {
            html: 'somehtml',
          },
        },
        {
          text: 'foo',
          value: '345',
          checked: false,
        },
      ])
    })
  })

  describe('BookingStatusTag', () => {
    const statuses = Object.keys(BookingStatusTag.statuses) as ReadonlyArray<BookingStatus>

    statuses.forEach(status => {
      it(`returns the correct tag for each BookingStatusTag with a status of ${status}`, () => {
        expect(new BookingStatusTag(status as never).html()).toEqual(
          `<strong class="govuk-tag govuk-tag--${BookingStatusTag.colours[status]} " data-cy-status="${status}" >${BookingStatusTag.statuses[status]}</strong>`,
        )
      })
    })
  })
})
