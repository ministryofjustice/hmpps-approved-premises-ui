import type { Cas1SpaceBookingShortSummary } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import paths from '../../paths/manage'
import { card, PlacementSubTab } from './index'

export const placementSideNavigation = (subTab: PlacementSubTab, crn: string, placementId: string) => {
  return [
    {
      text: 'Placement details',
      href: paths.resident.tabPlacement.placementDetails({ crn, placementId }),
      active: subTab === 'placement-details',
    },
    {
      text: 'Application',
      href: paths.resident.tabPlacement.application({ crn, placementId }),
      active: subTab === 'application',
    },
    {
      text: 'Previous AP stays',
      href: paths.resident.tabPlacement.previousApStays({ crn, placementId }),
      active: subTab === 'previous-ap-stays',
    },
  ]
}

// TODO: Some of these empty sections [] will be filled in the next relevant PRs/tickets
export const placementDetailsCards = (): Array<SummaryListWithCard> => []

export const applicationCards = (): Array<SummaryListWithCard> => []

export const previousApStaysCards = (
  bookings: Array<Cas1SpaceBookingShortSummary>,
  currentPlacementId: string,
): Array<SummaryListWithCard> => {
  return bookings
    .filter(booking => booking.id !== currentPlacementId)
    .sort((a, b) => {
      const aDate = a.actualArrivalDate || a.expectedArrivalDate
      const bDate = b.actualArrivalDate || b.expectedArrivalDate
      return bDate.localeCompare(aDate)
    })
    .map(booking => {
      const {
        actualArrivalDate,
        expectedArrivalDate,
        actualDepartureDate,
        expectedDepartureDate,
        departure,
        isNonArrival,
        nonArrival,
      } = booking

      if (isNonArrival) {
        return card(
          booking.premises.name,
          [
            summaryListItem('Expected arrival date', expectedArrivalDate, 'date'),
            summaryListItemNoBlankRows('Non-arrival reason', nonArrival?.reason?.name, 'textBlock'),
            summaryListItemNoBlankRows('Non-arrival notes', nonArrival?.notes, 'textBlock'),
          ].filter(Boolean),
        )
      }

      const arrivalDate = actualArrivalDate || expectedArrivalDate
      const arrivalDateLabel = `${actualArrivalDate ? 'Arrival' : 'Expected arrival'} date`
      const departureDate = actualDepartureDate || expectedDepartureDate
      const departureDateLabel = `${actualDepartureDate ? 'Departure' : 'Expected departure'} date`
      const departureReason = [departure.parentReason?.name, departure.reason?.name].filter(Boolean).join(' - ')

      return card(
        booking.premises.name,
        [
          summaryListItem(arrivalDateLabel, arrivalDate, 'date'),
          summaryListItem(departureDateLabel, departureDate, 'date'),
          summaryListItemNoBlankRows('Departure reason', departureReason, 'textBlock'),
          summaryListItemNoBlankRows('Departure reason notes', departure?.notes, 'textBlock'),
        ].filter(Boolean),
      )
    })
}
