import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { placementNameWithStatus } from '../placements'
import { detailedStatus, statusTextMap } from '../placements/status'

export const placementSummaryList = (placement: Cas1SpaceBookingSummary): SummaryList => ({
  rows: [
    summaryListItem('Approved Premises', placement.premises.name),
    // TODO: populate this from the spaceBookingSummary createdAt when available
    // summaryListItem('Date of match', placement.createdAt, 'date'),
    summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
    summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    summaryListItem('Status', statusTextMap[detailedStatus(placement)]),
    placement.deliusEventNumber && summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean),
})

type PlacementSummary = {
  title: string
  summaryList: SummaryList
}

export const placementsSummaries = (placementRequest: Cas1PlacementRequestDetail): Array<PlacementSummary> =>
  [...placementRequest.spaceBookings]
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .map(placement => ({
      title: placementNameWithStatus(placement),
      summaryList: placementSummaryList(placement),
    }))
