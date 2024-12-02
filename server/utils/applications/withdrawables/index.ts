import { Booking, BookingPremisesSummary, Cas1SpaceBooking, Withdrawable } from '../../../@types/shared'
import { RadioItem } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { DateFormats } from '../../dateUtils'
import { linkTo } from '../../utils'

export { sortAndFilterWithdrawables } from './sortAndFilterWithdrawables'

export type SelectedWithdrawableType = 'application' | 'placementRequest' | 'placement'

export const hintCopy: Record<SelectedWithdrawableType, string> = {
  application: `<p class="govuk-hint">You should only withdraw an application if your application is incorrect through significant changes in circumstances, an error in the application or duplication.</p>
                <p class="govuk-hint">Choose this option if you want to withdraw:</p>
                <ul class="govuk-hint">
                  <li>The application AND</li>
                  <li>The suitability assessment AND</li>
                  <li>All requests for placement made that are linked to this application AND</li>
                  <li>All AP placements that have already been made that are linked to this application</li>
                </ul>
                <p class="govuk-hint">
                  If you choose this option you will have to make another application should you need this
                  person to stay in an AP. <strong>This cannot be undone.</strong>
                </p>`,
  placement: `<p class="govuk-hint">This will cancel a placement booked into a specific AP and return the request for placement to the CRU to enable the person to be matched to an alternative placement</p>
  <p class="govuk-hint">There is no guarantee that a further placement will be available</p>`,
  placementRequest: `<p class="govuk-hint">Choose this option if you want to withdraw:</p>
  <ul class="govuk-hint">
    <li>A placement that has been requested and not yet booked or placements that have been booked AND</li>
    <li>You want to retain the application and suitability assessment so that you can make further requests for placement without completing a new application</li>
  </ul>
  <p class="govuk-hint">If you choose this option you will be able to complete a request for placement without needing to make another application should you need this person to stay in an AP</p>`,
}
export const withdrawableTypeRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedItem?: SelectedWithdrawableType,
) => {
  const radioItems: Array<RadioItem> = []

  if (withdrawables.find(w => w.type === 'application')) {
    radioItems.push({
      text: 'Application',
      value: 'application',
      checked: selectedItem === 'application',
      hint: {
        html: hintCopy.application,
      },
    })
  }

  if (withdrawables.find(w => w.type === 'placement_application' || w.type === 'placement_request'))
    radioItems.push({
      text: 'Request for placement',
      value: 'placementRequest',
      checked: selectedItem === 'placementRequest',
      hint: { html: hintCopy.placementRequest },
    })

  if (withdrawables.find(w => ['booking', 'space_booking'].includes(w.type))) {
    radioItems.push({
      text: 'Placement/Booking',
      value: 'placement',
      checked: selectedItem === 'placement',
      hint: {
        html: hintCopy.placement,
      },
    })
  }

  return radioItems
}

export const withdrawableRadioOptions = (
  withdrawables: Array<Withdrawable>,
  selectedWithdrawable?: Withdrawable['id'],
  allBookings: Array<Booking | Cas1SpaceBooking> = [],
): Array<RadioItem> => {
  const withDrawableRadioSection = (
    withdrawable: Withdrawable,
    premises: BookingPremisesSummary,
    hintLinkPath: string,
  ) => {
    const hint = hintLinkPath
      ? {
          hint: {
            html: linkTo(hintLinkPath, {
              text: 'See placement details (opens in a new tab)',
              attributes: { 'data-cy-withdrawable-id': withdrawable.id },
              openInNewTab: true,
            }),
          },
        }
      : {}
    return {
      text: `${premises ? `${premises.name} - ` : ''}${withdrawable.dates
        .map(datePeriod =>
          DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate, { format: 'short' }),
        )
        .join(', ')}`,
      value: withdrawable.id,
      checked: selectedWithdrawable === withdrawable.id,
      ...hint,
    }
  }

  return withdrawables.map(withdrawable => {
    if (withdrawable.type === 'placement_application') {
      return withDrawableRadioSection(withdrawable, null, null)
    }
    if (withdrawable.type === 'placement_request') {
      return withDrawableRadioSection(withdrawable, null, matchPaths.placementRequests.show({ id: withdrawable.id }))
    }
    if (withdrawable.type === 'booking') {
      const booking = allBookings.find(b => b.id === withdrawable.id) as Booking

      if (!booking) throw new Error(`Booking not found for withdrawable: ${withdrawable.id}`)
      return withDrawableRadioSection(
        withdrawable,
        booking.premises,
        managePaths.bookings.show({
          premisesId: booking.premises.id,
          bookingId: booking.id,
        }),
      )
    }
    if (withdrawable.type === 'space_booking') {
      const placement = allBookings.find(b => b.id === withdrawable.id) as Cas1SpaceBooking

      if (!placement) throw new Error(`Placement not found for withdrawable: ${withdrawable.id}`)
      return withDrawableRadioSection(
        withdrawable,
        placement.premises,
        managePaths.premises.placements.show({
          premisesId: placement.premises.id,
          placementId: withdrawable.id,
        }),
      )
    }
    throw new Error(`Unknown withdrawable type: ${withdrawable.type}`)
  })
}
