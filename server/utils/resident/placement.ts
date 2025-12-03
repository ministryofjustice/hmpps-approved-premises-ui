import type { Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import paths from '../../paths/manage'
import { canonicalDates, BREACH_OR_RECALL_REASON_ID } from '../placements'
import { card, PlacementSubTab } from './index'

export const placementSideNavigation = (subTab: PlacementSubTab, crn: string, placementId: string) => {
  const getPath = (section: string) => paths.resident.tabPlacement({ crn, placementId, section })
  return [
    {
      text: 'Placement details',
      href: getPath('placement-details'),
      active: subTab === 'placement-details',
    },
    {
      text: 'Application',
      href: getPath('application'),
      active: subTab === 'application',
    },
    {
      text: 'Previous AP stays',
      href: getPath('previous-ap-stays'),
      active: subTab === 'previous-ap-stays',
    },
  ]
}

// TODO: Some of these empty sections [] will be filled in the next relevant PRs/tickets
export const placementDetailsCards = (): Array<SummaryListWithCard> => []

export const applicationCards = (): Array<SummaryListWithCard> => []

export const previousApStaysCards = (bookings: Array<Cas1SpaceBooking>): Array<SummaryListWithCard> => {
  if (!bookings.length) return []

  return bookings.map(booking => {
    const { arrivalDate, departureDate } = canonicalDates(booking)

    let departureReason = booking.departure?.reason?.name || booking.departure?.parentReason?.name
    if (booking.departure?.parentReason?.id === BREACH_OR_RECALL_REASON_ID) {
      const parentName = booking.departure.parentReason.name
      const childName = booking.departure.reason?.name
      departureReason = childName ? `${parentName} - ${childName}` : parentName
    }

    const departureNotes = booking.departure?.notes

    return card(
      booking.premises.name,
      [
        summaryListItem('Arrival date', arrivalDate, 'date'),
        summaryListItem('Departure date', departureDate, 'date'),
        summaryListItemNoBlankRows('Departure reason', departureReason),
        summaryListItemNoBlankRows('Departure reason notes', departureNotes, 'textBlock'),
      ].filter(Boolean),
    )
  })
}

export const preArrivalCards = (): Array<SummaryListWithCard> => []

export const inductionCards = (): Array<SummaryListWithCard> => []

export const reviewsCards = (): Array<SummaryListWithCard> => []
