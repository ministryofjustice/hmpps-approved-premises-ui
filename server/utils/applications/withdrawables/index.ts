import { Booking, Withdrawable } from '../../../@types/shared'
import { RadioItem } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { DateFormats } from '../../dateUtils'
import { linkTo } from '../../utils'

export type SelectedWithdrawableType = 'application' | 'placementRequest' | 'booking'

export const withdrawableTypeRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedItem?: SelectedWithdrawableType,
) => {
  const radioItems: Array<RadioItem> = [
    {
      text: 'Application',
      value: 'application',
      checked: selectedItem === 'application',
      hint: {
        text: `This will withdraw the application, assessment, and any related placement requests and bookings.`,
      },
    },
  ]

  if (withdrawables.find(w => w.type === 'booking')) {
    radioItems.push({
      text: 'Booking',
      value: 'booking',
      checked: selectedItem === 'booking',
      hint: {
        text: 'This will withdraw a booking but retain the placement request so that the person can be matched somewhere else.',
      },
    })
  }

  if (withdrawables.find(w => w.type === 'placement_application' || w.type === 'placement_request'))
    radioItems.push({
      text: 'Placement request',
      value: 'placementRequest',
      checked: selectedItem === 'placementRequest',
      hint: { text: 'This will withdraw a placement request and any related bookings.' },
    })

  return radioItems
}

export const withdrawableRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedWithdrawable?: Withdrawable['id'],
  bookings: Array<Booking> = [],
): Array<RadioItem> => {
  return withdrawables.map(withdrawable => {
    if (withdrawable.type === 'placement_application') {
      return {
        text: withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', '),
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
      }
    }
    if (withdrawable.type === 'placement_request') {
      return {
        text: withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', '),
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
        hint: {
          html: linkTo(
            matchPaths.placementRequests.show,
            { id: withdrawable.id },
            {
              text: 'See placement details (opens in a new tab)',
              attributes: { 'data-cy-withdrawable-id': withdrawable.id },
              openInNewTab: true,
            },
          ),
        },
      }
    }
    if (withdrawable.type === 'booking') {
      const booking = bookings.find(b => b.id === withdrawable.id)

      if (!booking) throw new Error(`Booking not found for withdrawable: ${withdrawable.id}`)

      return {
        text: `${booking.premises.name} - ${withdrawable.dates
          .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
          .join(', ')}`,
        value: withdrawable.id,
        checked: selectedWithdrawable === withdrawable.id,
        hint: {
          html: linkTo(
            managePaths.bookings.show,
            { premisesId: booking.premises.id, bookingId: booking.id },
            {
              text: 'See booking details (opens in a new tab)',
              attributes: { 'data-cy-withdrawable-id': withdrawable.id },
              openInNewTab: true,
            },
          ),
        },
      }
    }
    throw new Error(`Unknown withdrawable type: ${withdrawable.type}`)
  })
}
