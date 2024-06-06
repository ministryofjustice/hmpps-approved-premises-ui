import type { IdentityBarMenu, UserDetails } from '@approved-premises/ui'

import type { Booking, ApprovedPremisesUserRole as UserRole } from '@approved-premises/api'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'

export const bookingActions = (user: UserDetails, booking: Booking): Array<IdentityBarMenu> => {
  if (user.roles?.includes('workflow_manager')) return v1BookingActions(user.roles, booking)
  if (user.roles?.includes('manager')) return v1BookingActions(user.roles, booking)
  if (user.roles?.includes('legacy_manager')) return v1BookingActions(user.roles, booking)
  if (user.roles?.includes('future_manager')) return v2BookingActions(booking)
  return []
}

export const v2BookingActions = (booking: Booking): Array<IdentityBarMenu> => {
  if (booking.status === 'awaiting-arrival')
    return [
      {
        items: [
          {
            text: 'Withdraw placement',
            classes: 'govuk-button--secondary',
            href: applyPaths.applications.withdraw.new({ id: booking.applicationId }),
          },
        ],
      },
    ]

  return []
}

export const v1BookingActions = (roles: Array<UserRole>, booking: Booking): Array<IdentityBarMenu> => {
  const withdrawalLink = !booking?.applicationId
    ? paths.bookings.cancellations.new({ premisesId: booking.premises.id, bookingId: booking.id })
    : applyPaths.applications.withdraw.new({ id: booking?.applicationId })

  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = []

    if (roles.includes('manager') || roles.includes('legacy_manager')) {
      items.push({
        text: 'Move person to a new bed',
        classes: 'govuk-button--secondary',
        href: paths.bookings.moves.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })
    }

    if (booking.status === 'awaiting-arrival') {
      if (roles.includes('manager')) {
        items.push({
          text: 'Mark as arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.arrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
        items.push({
          text: 'Mark as not arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.nonArrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      }
      if (roles.includes('workflow_manager')) {
        items.push({
          text: 'Withdraw placement',
          classes: 'govuk-button--secondary',
          href: withdrawalLink,
        })
      }

      if (roles.includes('manager') || roles.includes('legacy_manager')) {
        items.push({
          text: 'Change placement dates',
          classes: 'govuk-button--secondary',
          href: paths.bookings.dateChanges.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      }
    }

    if (booking.status === 'arrived') {
      if (roles.includes('manager')) {
        items.push({
          text: 'Log departure',
          classes: 'govuk-button--secondary',
          href: paths.bookings.departures.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      }
      items.push({
        text: 'Update departure date',
        classes: 'govuk-button--secondary',
        href: paths.bookings.extensions.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })
      if (roles.includes('workflow_manager')) {
        items.push({
          text: 'Withdraw placement',
          classes: 'govuk-button--secondary',
          href: withdrawalLink,
        })
      }
    }

    return [
      {
        items,
      },
    ]
  }

  return null
}
