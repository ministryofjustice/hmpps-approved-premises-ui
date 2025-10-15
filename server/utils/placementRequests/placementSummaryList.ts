import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { summaryListItem } from '../formUtils'
import { placementNameWithStatus } from '../placements'
import { characteristicsBulletList } from '../characteristicsUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import managePaths from '../../paths/manage'

export const placementSummaryList = (placement: Cas1SpaceBookingSummary): SummaryList => ({
  rows: [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    placement.actualArrivalDate
      ? summaryListItem('Actual arrival date', placement.actualArrivalDate, 'date')
      : summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
    placement.actualDepartureDate
      ? summaryListItem('Actual departure date', placement.actualDepartureDate, 'date')
      : summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    summaryListItem(
      'AP requirements',
      characteristicsBulletList(filterApLevelCriteria(placement.characteristics)),
      'html',
    ),
    summaryListItem(
      'Room requirements',
      characteristicsBulletList(filterRoomLevelCriteria(placement.characteristics)),
      'html',
    ),
    placement.deliusEventNumber && summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean),
})

type PlacementSummary = {
  title: string
  summaryList: SummaryList
  link: string
}

export const placementsSummaries = (placementRequest: Cas1PlacementRequestDetail): Array<PlacementSummary> =>
  [...placementRequest.spaceBookings]
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .map(placement => ({
      title: placementNameWithStatus(placement),
      summaryList: placementSummaryList(placement),
      link: managePaths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id }),
    }))
