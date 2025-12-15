import { Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { TabData } from './index'
import { summaryListItem } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'

function arrivalCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  const rows = [summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date')]

  if (placement.actualArrivalDate) {
    rows.push(summaryListItem('Actual arrival date', placement.actualArrivalDate, 'date'))
  }

  if (placement.actualArrivalTime) {
    rows.push(summaryListItem('Arrival time', placement.actualArrivalTime))
  }

  return rows
}

function departureCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  const rows = [summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date')]

  if (placement.actualDepartureDate) {
    rows.push(summaryListItem('Actual departure date', placement.actualDepartureDate, 'date'))
  }

  if (placement.actualDepartureTime) {
    rows.push(summaryListItem('Departure time', placement.actualDepartureTime))
  }

  if (placement.departure?.parentReason) {
    rows.push(summaryListItem('Parent departure reason', placement.departure.parentReason.name))
  }

  if (placement.departure?.reason) {
    rows.push(summaryListItem('Departure reason', placement.departure.reason.name))
  }

  if (placement.departure?.moveOnCategory) {
    rows.push(summaryListItem('Move-on category', placement.departure.moveOnCategory.name))
  }

  if (placement.departure?.notes) {
    rows.push(summaryListItem('Departure notes', placement.departure.notes))
  }

  return rows
}

export const placementDetailsCards = (placement: Cas1SpaceBooking): Array<SummaryListWithCard> => {
  let rows = [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date allocated', placement.createdAt, 'date'),
    summaryListItem('Status', placementStatusTag(placement), 'html'),
    summaryListItem('NDelius event number', placement.deliusEventNumber),
  ]

  rows = rows.concat(arrivalCardRows(placement))
  rows = rows.concat(departureCardRows(placement))
  rows = rows.concat(requirementsInformation(placement).rows)

  return [
    {
      card: { title: { text: placement.premises.name } },
      rows,
    },
  ]
}

export const placementTabController = (placement: Cas1SpaceBooking): TabData => {
  return {
    subHeading: 'Current placement',
    cardList: placementDetailsCards(placement),
  }
}
