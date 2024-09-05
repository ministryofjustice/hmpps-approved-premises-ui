import type { IdentityBarMenu, UserDetails } from '@approved-premises/ui'

import type { Booking } from '@approved-premises/api'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { hasPermission } from '../users'

export const bookingActions = (user: UserDetails, booking: Booking): Array<IdentityBarMenu> => {
  if (user.roles?.includes('workflow_manager')) return v1BookingActions(user, booking)
  if (user.roles?.includes('manager')) return v1BookingActions(user, booking)
  if (user.roles?.includes('legacy_manager')) return v1BookingActions(user, booking)
  if (user.roles?.includes('future_manager')) return v2BookingActions(user, booking)
  return []
}

class MenuItems {
  constructor(public booking: Booking) {}

  bookingCancellationPath = () => {
    return paths.bookings.cancellations.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id })
  }

  applicationWithdrawalPath = () => {
    return applyPaths.applications.withdraw.new({ id: this.booking?.applicationId })
  }

  bookingHasNoApplicationAssociatedByBothCrnAndEventNumber = () => {
    return !this.booking?.applicationId
  }

  withdrawalLink = () => {
    if (this.bookingHasNoApplicationAssociatedByBothCrnAndEventNumber()) {
      return this.bookingCancellationPath()
    }
    return this.applicationWithdrawalPath()
  }

  items = {
    movePerson: {
      text: 'Move person to a new bed',
      classes: 'govuk-button--secondary',
      href: paths.bookings.moves.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    markAsArrived: {
      text: 'Mark as arrived',
      classes: 'govuk-button--secondary',
      href: paths.bookings.arrivals.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    markAsNotArrived: {
      text: 'Mark as not arrived',
      classes: 'govuk-button--secondary',
      href: paths.bookings.nonArrivals.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    changeDates: {
      text: 'Change placement dates',
      classes: 'govuk-button--secondary',
      href: paths.bookings.dateChanges.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    logDeparture: {
      text: 'Log departure',
      classes: 'govuk-button--secondary',
      href: paths.bookings.departures.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    updateDepartureDate: {
      text: 'Update departure date',
      classes: 'govuk-button--secondary',
      href: paths.bookings.extensions.new({ premisesId: this.booking.premises.id, bookingId: this.booking.id }),
    },
    withdrawPlacement: {
      text: 'Withdraw placement',
      classes: 'govuk-button--secondary',
      href: this.withdrawalLink(),
    },
  }

  item = (label: string) => {
    return this.items[label]
  }
}

export const v2BookingActions = (user: UserDetails, booking: Booking): Array<IdentityBarMenu> => {
  const menuItems = new MenuItems(booking)

  if (booking.status === 'awaiting-arrival' && hasPermission(user, ['cas1_booking_withdraw']))
    return [
      {
        items: [menuItems.item('withdrawPlacement')],
      },
    ]

  return []
}

export const v1BookingActions = (user: UserDetails, booking: Booking): Array<IdentityBarMenu> => {
  const menuItems = new MenuItems(booking)
  const usersRoles = user.roles

  if (booking.status === 'awaiting-arrival' || booking.status === 'arrived') {
    const items = []

    if (usersRoles.includes('manager') || usersRoles.includes('legacy_manager')) {
      items.push(menuItems.item('movePerson'))
    }

    if (booking.status === 'awaiting-arrival') {
      if (usersRoles.includes('manager')) {
        items.push(menuItems.item('markAsArrived'))
        items.push(menuItems.item('markAsNotArrived'))
      }
      if (hasPermission(user, ['cas1_booking_withdraw'])) {
        items.push(menuItems.item('withdrawPlacement'))
      }

      if (usersRoles.includes('manager') || usersRoles.includes('legacy_manager')) {
        items.push(menuItems.item('changeDates'))
      }
    }

    if (booking.status === 'arrived') {
      if (usersRoles.includes('manager')) {
        items.push(menuItems.item('logDeparture'))
      }

      items.push(menuItems.item('updateDepartureDate'))

      if (hasPermission(user, ['cas1_booking_withdraw'])) {
        items.push(menuItems.item('withdrawPlacement'))
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
