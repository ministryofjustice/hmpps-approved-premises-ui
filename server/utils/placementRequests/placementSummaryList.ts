import { Cas1PlacementRequestDetail, Cas1SpaceBooking, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { detailedStatus, statusTextMap } from '../placements'
import { DateFormats } from '../dateUtils'
import { PlacementStatusTag } from '../placements/statusTag'
import { StatusTagOptions } from '../statusTag'

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

export const placementName = (placement: Cas1SpaceBookingSummary): string =>
  `${placement.premises.name} from ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate)}`

export const placementStatus = (
  placement: Cas1SpaceBookingSummary | Cas1SpaceBooking,
  options: StatusTagOptions = {},
): string =>
  new PlacementStatusTag(detailedStatus(placement), {
    ...options,
    classes: `govuk-tag--nowrap ${options.classes || ''}`,
  }).html()

export const placementNameWithStatus = (placement: Cas1SpaceBookingSummary): string =>
  `${placementName(placement)} ${placementStatus(placement, { classes: 'govuk-!-margin-left-1' })}`

export const placementsSummaries = (placementRequest: Cas1PlacementRequestDetail): Array<PlacementSummary> =>
  [...placementRequest.spaceBookings]
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .map(placement => ({
      title: placementNameWithStatus(placement),
      summaryList: placementSummaryList(placement),
    }))
