import { Booking, Withdrawable } from '../../../@types/shared'
import { RadioItem } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import managePaths from '../../../paths/manage'
import { DateFormats } from '../../dateUtils'
import { linkTo } from '../../utils'

export { sortAndFilterWithdrawables } from './sortAndFilterWithdrawables'

export type SelectedWithdrawableType = 'application' | 'placementRequest' | 'placement'

export const hintCopy: Record<SelectedWithdrawableType, string> = {
  application: `This will withdraw the application, the suitability assessment, any requests for placement, any matching tasks, and any placements assigned to an AP. You should only withdraw an application if your application is incorrect through circumstantial changes or error.If you choose this option you will have to make another application should you need this person to stay in an AP. This cannot be undone.`,
  placement: `This will cancel a placement booked into a specific AP but will retain the request for placement so that the Applicant can be matched to another AP.This will mean the Applicant no longer has a space in this AP, but the request for placement will be reopened for matching into a AP space for the dates provided in the application or request for placement.If you want to request a placement for new/different dates, you should withdraw the placement request and make a new placement request. There is no guarantee that a further placement will be available.`,
  placementRequest: `<p class="govuk-hint">This will withdraw the following Request for Placement tasks:</p>
  <ul class="govuk-hint"><li>A match request made after an application where the date is known</li>
  <li>A request for placement mini assessment</li>
  <li>A match request made after a request for placement has been approved</li></ul>
  <p class="govuk-hint">It will also remove any placements to an AP that are attached to these Request for Placements. 
  This option should be selected if the applicant is no longer requiring an AP placement on the dates recorded but still needs an AP placement now or in the future. 
  This will cancel the selected placement and allow you to request a new placement.</p>`,
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
        text: hintCopy.application,
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

  if (withdrawables.find(w => w.type === 'booking')) {
    radioItems.push({
      text: 'Placement',
      value: 'placement',
      checked: selectedItem === 'placement',
      hint: {
        text: hintCopy.placement,
      },
    })
  }

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
              text: 'See placement details (opens in a new tab)',
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
