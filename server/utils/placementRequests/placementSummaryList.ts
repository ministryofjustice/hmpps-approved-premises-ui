import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { detailedStatus, overallStatus, statusTextMap } from '../placements'
import { DateFormats } from '../dateUtils'

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

export const placementTitle = (placement: Cas1SpaceBookingSummary): string =>
  `${placement.premises.name} - ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate)} - ${statusTextMap[overallStatus(placement)]}`

export const placementsSummaries = (placementRequest: Cas1PlacementRequestDetail): Array<PlacementSummary> =>
  [...placementRequest.spaceBookings]
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .map(placement => ({
      title: placementTitle(placement),
      summaryList: placementSummaryList(placement),
    }))
