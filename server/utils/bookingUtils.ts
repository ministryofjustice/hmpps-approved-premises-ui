import type { IdentityBarMenu, TableRow } from '@approved-premises/ui'
import type { Booking } from '@approved-premises/api'
import paths from '../paths/manage'
import { DateFormats } from './dateUtils'

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
      text: booking.person.crn,
    },
    {
      text: DateFormats.isoDateToUIDate(type === 'arrival' ? booking.arrivalDate : booking.departureDate),
    },
    {
      html: manageBookingLink(premisesId, booking),
    },
  ])
}

export const bookingActions = (booking: Booking, premisesId: string): Array<IdentityBarMenu> => {
  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = []

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
        text: 'Extend placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Cancel placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId, bookingId: booking.id }),
      })
    }

    if (booking.status === 'arrived') {
      items.push({
        text: 'Log departure',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.new({ premisesId, bookingId: booking.id }),
      })
      items.push({
        text: 'Extend placement',
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
