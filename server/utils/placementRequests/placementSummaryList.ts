import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { detailedStatus, statusTextMap } from '../placements'

export const placementSummaryList = (placementRequest: Cas1PlacementRequestDetail): SummaryList => {
  if (placementRequest.spaceBookings.length) {
    const booking = placementRequest.spaceBookings[0]

    return {
      rows: [
        summaryListItem('Approved Premises', booking.premises.name),
        summaryListItem('Date of match', placementRequest.booking.createdAt, 'date'),
        summaryListItem('Expected arrival date', booking.expectedArrivalDate, 'date'),
        summaryListItem('Expected departure date', booking.expectedDepartureDate, 'date'),
        summaryListItem('Status', statusTextMap[detailedStatus(booking)]),
        booking.deliusEventNumber && summaryListItem('Delius event number', booking.deliusEventNumber),
      ].filter(Boolean),
    }
  }

  return undefined
}
