import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { withdrawnStatusTag } from '../applications/utils'
import {
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  placementDates,
  formatDuration,
  requestedOrEstimatedArrivalDateRow,
} from '../match'
import { matchingInformationSummaryRows } from './matchingInformationSummaryList'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

type PlacementRequestSummaryListOptions = {
  showActions?: boolean
}

export const placementRequestSummaryList = (
  placementRequest: Cas1PlacementRequestDetail,
  options: PlacementRequestSummaryListOptions = { showActions: true },
): SummaryList => {
  const {
    application,
    location,
    releaseType,
    authorisedPlacementPeriod: { arrival, duration, arrivalFlexible },
  } = placementRequest
  const { startDate, endDate } = placementDates(arrival, String(duration))

  const isRotl = releaseType === 'rotl' && [true, false].includes(arrivalFlexible)

  const rows: Array<SummaryListItem> = [
    requestedOrEstimatedArrivalDateRow(placementRequest.isParole, startDate),
    summaryListItem('Requested departure date', endDate, 'date'),
    summaryListItemNoBlankRows('Flexible date', isRotl && (arrivalFlexible ? 'Yes' : 'No')),
    summaryListItem('Length of stay', formatDuration(duration)),
    summaryListItem('Release type', allReleaseTypes[releaseType]),
    summaryListItem('Licence expiry date', application?.licenceExpiryDate, 'date'),
    options.showActions ? apTypeWithViewTimelineActionRow(placementRequest) : apTypeRow(placementRequest.type),
    summaryListItem('Preferred postcode', location),
  ].filter(Boolean)

  if (placementRequest.isWithdrawn) {
    rows.push(withdrawnStatusTag)
  }

  const matchingInformationRows = matchingInformationSummaryRows(placementRequest)
  return { rows: rows.concat(matchingInformationRows) }
}
