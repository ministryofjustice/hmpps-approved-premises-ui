import { Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { ResidentProfileSubTab, TabData } from './index'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'
import paths from '../../paths/manage'

export const placementSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placement: Cas1SpaceBooking) => {
  const basePath = paths.resident.tabPlacement
  const placementId = placement.id
  return [
    {
      text: `${placement.premises.name} placement`,
      href: basePath.placementDetails({ crn, placementId }),
      active: subTab === 'placementDetails',
    },
    {
      text: 'All AP placements',
      href: basePath.allApPlacements({ crn, placementId }),
      active: subTab === 'allApPlacements',
    },
    {
      text: 'Application',
      href: basePath.application({ crn, placementId }),
      active: subTab === 'application',
    },
  ]
}

function arrivalCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  return [
    summaryListItemNoBlankRows(
      'Expected arrival date',
      placement.actualArrivalDate ? '' : placement.expectedArrivalDate,
      'shortDate',
    ),
    summaryListItemNoBlankRows('Actual arrival date', placement.actualArrivalDate, 'shortDate'),
    summaryListItemNoBlankRows('Arrival time', placement.actualArrivalTime, 'time'),
  ].filter(Boolean)
}

function departureCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  return [
    summaryListItemNoBlankRows(
      'Expected departure date',
      placement.actualDepartureDate ? '' : placement.expectedDepartureDate,
      'shortDate',
    ),
    summaryListItemNoBlankRows('Actual departure date', placement.actualDepartureDate, 'shortDate'),
    summaryListItemNoBlankRows('Departure time', placement.actualDepartureTime, 'time'),
    summaryListItemNoBlankRows('Parent departure reason', placement.departure?.parentReason?.name),
    summaryListItemNoBlankRows('Departure reason', placement.departure?.reason?.name),
    summaryListItemNoBlankRows('Move-on category', placement.departure?.moveOnCategory?.name),
    summaryListItemNoBlankRows('Departure notes', placement.departure?.notes),
  ].filter(Boolean)
}

export const placementDetailsCards = (placement: Cas1SpaceBooking): Array<SummaryListWithCard> => {
  const rows = [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date allocated', placement.createdAt, 'shortDate'),
    summaryListItem('Status', placementStatusTag(placement), 'html'),
    ...arrivalCardRows(placement),
    ...departureCardRows(placement),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ]

  return [
    {
      card: { title: { text: placement.premises.name } },
      rows,
    },
  ]
}

export const placementTabController = (placement: Cas1SpaceBooking): TabData => {
  return {
    subHeading: `${placement.premises.name} AP placement`,
    cardList: placementDetailsCards(placement),
  }
}
