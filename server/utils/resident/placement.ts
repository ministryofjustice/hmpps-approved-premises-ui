import { Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { TabData } from './index'
import { summaryListItem } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'

export const placementDetailsCards = (placement: Cas1SpaceBooking): Array<SummaryListWithCard> => {
  return [
    {
      card: { title: { text: 'Placement' } },
      rows: [
        summaryListItem('Approved Premises', placement.premises.name),
        summaryListItem('Date allocated', placement.createdAt, 'date'),
        summaryListItem('Status', placementStatusTag(placement), 'html'),
        summaryListItem('NDelius event number', placement.deliusEventNumber),
      ],
    },
    {
      card: { title: { text: 'Arrival' } },
      rows: [
        summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
        summaryListItem('Actual arrival date', placement.actualArrivalDate, 'date'),
        summaryListItem('Arrival time', placement.actualArrivalTime),
      ],
    },
    {
      card: { title: { text: 'Departure' } },
      rows: [summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date')],
    },
    {
      card: { title: { text: 'Booking details' } },
      rows: requirementsInformation(placement).rows,
    },
  ]
}

export const placementTabController = (placement: Cas1SpaceBooking): TabData => {
  return {
    subHeading: 'Placement details',
    cardList: placementDetailsCards(placement),
  }
}
