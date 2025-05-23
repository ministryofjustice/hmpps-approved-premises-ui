import type { IdentityBarMenu, IdentityBarMenuItem, UserDetails } from '@approved-premises/ui'

import type { Booking } from '@approved-premises/api'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { hasPermission } from '../users'

export const bookingActions = (user: UserDetails, booking: Booking): Array<IdentityBarMenu> => {
  const menuItems = new MenuItems(booking)

  const items = []

  if (booking.status === 'awaiting-arrival') {
    if (hasPermission(user, ['cas1_booking_withdraw'])) {
      items.push(menuItems.item('withdrawPlacement'))
    }

    if (hasPermission(user, ['cas1_booking_change_dates'])) {
      items.push(menuItems.item('changeDates'))
    }
  }

  if (booking.status === 'arrived') {
    if (hasPermission(user, ['cas1_booking_change_dates'])) {
      items.push(menuItems.item('updateDepartureDate'))
    }

    if (hasPermission(user, ['cas1_booking_withdraw'])) {
      items.push(menuItems.item('withdrawPlacement'))
    }
  }

  return items.length
    ? [
        {
          items,
        },
      ]
    : null
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

  items: Record<string, IdentityBarMenuItem> = {
    changeDates: {
      text: 'Change placement dates',
      classes: 'govuk-button--secondary',
      href: paths.bookings.dateChanges.new({
        premisesId: this.booking.premises.id,
        bookingId: this.booking.id,
      }),
    },
    updateDepartureDate: {
      text: 'Update departure date',
      classes: 'govuk-button--secondary',
      href: paths.bookings.extensions.new({
        premisesId: this.booking.premises.id,
        bookingId: this.booking.id,
      }),
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
