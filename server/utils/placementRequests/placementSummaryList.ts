import { PlacementRequestDetail } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { DateFormats } from '../dateUtils'
import { detailedStatus, statusTextMap } from '../placements'

export const placementSummaryList = (placementRequest: PlacementRequestDetail): SummaryList => {
  if (placementRequest.spaceBookings.length) {
    const booking = placementRequest.spaceBookings[0]

    return {
      rows: [
        summaryListItem('Approved Premises', booking.premises.name),
        summaryListItem('Date of match', DateFormats.isoDateToUIDate(placementRequest.booking.createdAt)),
        summaryListItem('Expected arrival date', DateFormats.isoDateToUIDate(booking.expectedArrivalDate)),
        summaryListItem('Expected departure date', DateFormats.isoDateToUIDate(booking.expectedDepartureDate)),
        summaryListItem('Status', statusTextMap[detailedStatus(booking)]),
        booking.deliusEventNumber && summaryListItem('Delius event number', booking.deliusEventNumber),
      ].filter(Boolean),
    }
  }

  return undefined
}
