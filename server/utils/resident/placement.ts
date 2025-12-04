import type { Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import paths from '../../paths/manage'
import { canonicalDates } from '../placements'
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
    const departureNotes = booking.additionalInformation
    const transferReasonName = booking.transferReason

    return card(
      booking.premises.name,
      [
        summaryListItem('Arrival date', arrivalDate, 'date'),
        summaryListItem('Departure date', departureDate, 'date'),
        summaryListItemNoBlankRows('Departure reason', transferReasonName, 'textBlock'),
        summaryListItemNoBlankRows('Departure reason notes', departureNotes, 'textBlock'),
      ].filter(Boolean),
    )
  })
}
