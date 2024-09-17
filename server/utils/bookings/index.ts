import type {
  BespokeError,
  SelectOption,
  SummaryListItem,
  SummaryListWithCard,
  TableCell,
  TableRow,
} from '@approved-premises/ui'
import type { BedSummary, Booking, BookingStatus, BookingSummary, PremisesBooking } from '@approved-premises/api'
import { addDays, isBefore, isEqual, isWithinInterval } from 'date-fns'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import assessPaths from '../../paths/assess'
import { DateFormats, todayAtMidnight } from '../dateUtils'
import { SanitisedError } from '../../sanitisedError'
import { linebreaksToParagraphs, linkTo } from '../utils'
import { isFullPerson, laoName } from '../personUtils'
import { convertObjectsToRadioItems } from '../formUtils'
import { StatusTag, StatusTagOptions } from '../statusTag'
import { bookingActions, v1BookingActions, v2BookingActions } from './bookingActions'

const UPCOMING_WINDOW_IN_DAYS = 365 * 10

type ConflictingEntityType = 'booking' | 'lostBed'

type ParsedConflictError = {
  conflictingEntityId: string
  conflictingEntityType: ConflictingEntityType
}

export { bookingActions, v1BookingActions, v2BookingActions }

export const bookingSummaryList = (booking: BookingSummary): SummaryListWithCard => {
  return {
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
          text: booking.premisesName,
        },
      },
      {
        key: {
          text: 'Date of match',
        },
        value: {
          text: DateFormats.isoDateToUIDate(booking.createdAt),
        },
      },
      {
        key: {
          text: 'Expected arrival date',
        },
        value: {
          text: DateFormats.isoDateToUIDate(booking.arrivalDate),
        },
      },
      {
        key: {
          text: 'Expected departure date',
        },
        value: {
          text: DateFormats.isoDateToUIDate(booking.departureDate),
        },
      },
    ],
  }
}

export const manageBookingLink = (premisesId: string, booking: Booking | PremisesBooking): string => {
  return booking.id && booking.person
    ? `<a href="${paths.bookings.show({ premisesId, bookingId: booking.id })}" data-cy-booking-id="${booking.id}">
    Manage
    <span class="govuk-visually-hidden">
      booking for ${booking.person.crn}
    </span>
  </a>`
    : 'Unable to manage booking'
}

export const arrivingTodayOrLate = (bookings: Array<PremisesBooking>, premisesId: string): Array<TableRow> => {
  const filteredBookings = bookings
    .filter(booking => booking.status === 'awaiting-arrival')
    .filter(
      booking =>
        isEqual(DateFormats.isoToDateObj(booking.arrivalDate), todayAtMidnight()) ||
        isBefore(DateFormats.isoToDateObj(booking.arrivalDate), todayAtMidnight()),
    )

  return bookingsToTableRows(filteredBookings, premisesId, 'arrival')
}

export const departingTodayOrLate = (bookings: Array<PremisesBooking>, premisesId: string): Array<TableRow> => {
  const filteredBookings = bookings
    .filter(booking => booking.status === 'arrived')
    .filter(
      booking =>
        isEqual(DateFormats.isoToDateObj(booking.departureDate), todayAtMidnight()) ||
        isBefore(DateFormats.isoToDateObj(booking.departureDate), todayAtMidnight()),
    )

  return bookingsToTableRows(filteredBookings, premisesId, 'departure')
}

export const upcomingArrivals = (bookings: Array<PremisesBooking>, premisesId: string): Array<TableRow> => {
  return bookingsToTableRows(
    bookings.filter(
      booking =>
        booking.status === 'awaiting-arrival' &&
        isWithinInterval(DateFormats.isoToDateObj(booking.arrivalDate), {
          start: addDays(todayAtMidnight(), 1),
          end: addDays(todayAtMidnight(), UPCOMING_WINDOW_IN_DAYS + 1),
        }),
    ),
    premisesId,
    'arrival',
  )
}

export const upcomingDepartures = (bookings: Array<PremisesBooking>, premisesId: string): Array<TableRow> => {
  return bookingsToTableRows(
    bookings.filter(
      booking =>
        booking.status === 'arrived' &&
        isWithinInterval(DateFormats.isoToDateObj(booking.departureDate), {
          start: addDays(todayAtMidnight(), 1),
          end: addDays(todayAtMidnight(), UPCOMING_WINDOW_IN_DAYS + 1),
        }),
    ),
    premisesId,
    'departure',
  )
}

export const arrivedBookings = (bookings: Array<PremisesBooking>, premisesId: string): Array<TableRow> => {
  return bookingsToTableRows(
    bookings.filter(booking => booking.status === 'arrived'),
    premisesId,
    'departure',
  )
}

export const bookingsToTableRows = (
  bookings: Array<PremisesBooking>,
  premisesId: string,
  type: 'arrival' | 'departure',
): Array<TableRow> => {
  return bookings.map(booking => [
    nameCell(booking),
    {
      text: booking.person.crn,
    },
    {
      text: DateFormats.isoDateToUIDate(type === 'arrival' ? booking.arrivalDate : booking.departureDate),
    },
    {
      text: booking.bed?.name || 'Not allocated',
    },
    {
      html: manageBookingLink(premisesId, booking),
    },
  ])
}

export const nameCell = (booking: PremisesBooking): TableCell =>
  isFullPerson(booking.person) ? { text: laoName(booking.person) } : { text: `LAO: ${booking.person.crn}` }

export const generateConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  datesGrammaticalNumber: 'plural' | 'singular',
  bedId?: string,
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title = (
    conflictingEntityType === 'lostBed'
      ? 'Out of service bed record cannot be created for the $date$ entered'
      : 'This bedspace is not available for the $date$ entered'
  ).replace('$date$', datesGrammaticalNumber === 'plural' ? 'dates' : 'date')

  const link =
    conflictingEntityType === 'lostBed' && bedId
      ? `<a href="${paths.v2Manage.outOfServiceBeds.show({ premisesId, bedId, id: conflictingEntityId, tab: 'details' })}">existing out of service beds record</a>`
      : `<a href="${paths.bookings.show({
          premisesId,
          bookingId: conflictingEntityId,
        })}">existing booking</a>`
  const message = datesGrammaticalNumber === 'plural' ? `They conflict with an ${link}` : `It conflicts with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

const parseConflictError = (detail: string): ParsedConflictError => {
  /**
   *  Return the entity type and id by parsing an error detail string
   *  @param detail - string is text containing the entity id at the end preceded by ': '
   *    e.g. "An out-of-service bed already exists for dates from 2024-10-01 to 2024-10-14 which overlaps with the desired dates: 220a71da-bf5c-424d-94ff-254ecac5b857"
   */
  const [message, conflictingEntityId] = detail.split(':').map((s: string) => s.trim())
  const conflictingEntityType = message.includes('out-of-service bed') ? 'lostBed' : 'booking'
  return { conflictingEntityId, conflictingEntityType }
}

export const bedsAsSelectItems = (beds: Array<BedSummary>, selectedId: string): Array<SelectOption> => {
  return beds.map(bed => ({
    text: `Bed name: ${bed.name}, room name: ${bed.roomName}`,
    value: bed.id,
    selected: selectedId === bed.id,
  }))
}

export const bookingPersonRows = (booking: Booking): Array<SummaryListItem> => {
  return [
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
        html: new BookingStatusTag(booking.status).html(),
      },
    },
  ]
}

export const bookingArrivalRows = (booking: Booking): Array<SummaryListItem> => {
  const rows = []

  if (booking.arrival) {
    rows.push({
      key: { text: 'Actual arrival date' },
      value: { text: DateFormats.isoDateToUIDate(booking.arrival.arrivalDate) },
    })

    if (booking.arrival.notes) {
      rows.push({
        key: {
          text: 'Notes',
        },
        value: {
          html: linebreaksToParagraphs(booking.arrival.notes),
        },
      })
    }
  } else {
    rows.push({
      key: { text: 'Expected arrival date' },
      value: { text: DateFormats.isoDateToUIDate(booking.arrivalDate) },
    })
  }

  return rows
}

export const bookingDepartureRows = (booking: Booking): Array<SummaryListItem> => {
  const rows = []

  if (booking.departure) {
    rows.push(
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
    )

    if (booking.departure.notes) {
      rows.push({
        key: {
          text: 'Notes',
        },
        value: {
          html: linebreaksToParagraphs(booking.departure.notes),
        },
      })
    }
  } else {
    rows.push({
      key: { text: 'Expected departure date' },
      value: { text: DateFormats.isoDateToUIDate(booking.departureDate) },
    })
  }

  return rows
}

export const bookingShowDocumentRows = (booking: Booking): Array<SummaryListItem> => {
  const rows = []

  if (booking?.applicationId) {
    rows.push({
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
    })
  } else {
    rows.push({
      key: {
        text: 'Application',
      },
      value: {
        text: 'No application attached to booking',
      },
    })
  }

  if (booking?.assessmentId) {
    rows.push({
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
    })
  } else {
    rows.push({
      key: {
        text: 'Assessment',
      },
      value: {
        text: 'No assessment attached to booking',
      },
    })
  }

  return rows
}

export const cancellationRows = (booking: Booking): Array<SummaryListItem> => {
  if (booking.cancellation) {
    return [
      {
        key: {
          text: 'Cancelled on',
        },
        value: {
          text: DateFormats.isoDateToUIDate(booking.cancellation.createdAt),
        },
      },
      {
        key: {
          text: 'Reason',
        },
        value: {
          text:
            booking.cancellation.reason.name === 'Other'
              ? `${booking.cancellation.reason.name} - ${booking.cancellation.otherReason}`
              : booking.cancellation.reason.name,
        },
      },
    ]
  }
  return []
}

export const cancellationReasonsRadioItems = (
  cancellationReasons: Array<Record<string, string>>,
  otherHtml: string,
  context: Record<string, unknown>,
): Array<SelectOption> => {
  const items = convertObjectsToRadioItems(cancellationReasons, 'name', 'id', 'cancellation[reason]', context)

  return items.map(item => {
    if (item.text === 'Other') {
      item.conditional = {
        html: otherHtml,
      }
    }

    return item
  })
}

export class BookingStatusTag extends StatusTag<BookingStatus> {
  static readonly statuses: Record<BookingStatus, string> = {
    arrived: 'Arrived',
    'awaiting-arrival': 'Awaiting arrival',
    'not-arrived': 'Not arrived',
    departed: 'Departed',
    cancelled: 'Cancelled',
    provisional: 'Provisional',
    confirmed: 'Confirmed',
    closed: 'Closed',
  }

  static readonly colours: Record<BookingStatus, string> = {
    arrived: '',
    'awaiting-arrival': 'blue',
    'not-arrived': 'red',
    departed: 'pink',
    cancelled: 'red',
    provisional: 'yellow',
    confirmed: 'blue',
    closed: 'red',
  }

  constructor(status: BookingStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: BookingStatusTag.statuses,
      colours: BookingStatusTag.colours,
    })
  }
}
