import type {
  BespokeError,
  IdentityBarMenu,
  SelectOption,
  SummaryListItem,
  SummaryListWithCard,
  TableRow,
} from '@approved-premises/ui'
import type { BedSummary, Booking, BookingSummary } from '@approved-premises/api'
import paths from '../paths/manage'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { DateFormats } from './dateUtils'
import { SanitisedError } from '../sanitisedError'
import { linkTo } from './utils'

type ParsedConflictError = {
  conflictingEntityId: string
  conflictingEntityType: 'booking' | 'lost-bed'
}

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

export const manageBookingLink = (premisesId: string, booking: Booking): string => {
  return `<a href="${paths.bookings.show({ premisesId, bookingId: booking.id })}">
    Manage
    <span class="govuk-visually-hidden">
      booking for ${booking.person.crn}
    </span>
  </a>`
}

export const bookingsToTableRows = (
  bookings: Array<Booking>,
  premisesId: string,
  type: 'arrival' | 'departure',
): Array<TableRow> => {
  return bookings.map(booking => [
    {
      text: booking.person.name,
    },
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

export const bookingActions = (booking: Booking, premisesId: string): Array<IdentityBarMenu> => {
  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = [
      {
        text: 'Move person to a new bed',
        classes: 'govuk-button--secondary',
        href: paths.bookings.moves.new({ premisesId, bookingId: booking.id }),
      },
    ]

    if (booking.status === 'awaiting-arrival') {
      items.push({
        text: 'Mark as arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.arrivals.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Mark as not arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.nonArrivals.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Change placement dates',
        classes: 'govuk-button--secondary',
        href: paths.bookings.dateChanges.new({ premisesId, bookingId: booking.id }),
      })
    }

    if (booking.status === 'arrived') {
      items.push({
        text: 'Log departure',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Change departure date',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
      })
    }

    return [
      {
        items,
      },
    ]
  }

  return null
}

export const generateConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  bedId: string,
  datesGrammaticalNumber: 'plural' | 'singular',
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title =
    datesGrammaticalNumber === 'plural'
      ? 'This bedspace is not available for the dates entered'
      : 'This bedspace is not available for the date entered'

  const link =
    conflictingEntityType === 'lost-bed'
      ? `<a href="${paths.lostBeds.show({
          premisesId,
          bedId,
          id: conflictingEntityId,
        })}">existing lost bed</a>`
      : `<a href="${paths.bookings.show({
          premisesId,
          bookingId: conflictingEntityId,
        })}">existing booking</a>`

  const message = datesGrammaticalNumber === 'plural' ? `They conflict with an ${link}` : `It conflicts with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

const parseConflictError = (detail: string): ParsedConflictError => {
  const detailWords = detail.split(' ')
  const conflictingEntityId = detailWords[detailWords.length - 1]
  const conflictingEntityType = detail.includes('Lost Bed') ? 'lost-bed' : 'booking'

  return { conflictingEntityId, conflictingEntityType }
}

export const bedsAsSelectItems = (beds: Array<BedSummary>, selectedId: string): Array<SelectOption> => {
  return beds.map(bed => ({
    text: `Bed name: ${bed.name}, room name: ${bed.roomName}`,
    value: bed.id,
    selected: selectedId === bed.id,
  }))
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
