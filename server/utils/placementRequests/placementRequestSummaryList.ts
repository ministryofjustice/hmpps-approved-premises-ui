import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { withdrawnStatusTag } from '../applications/utils'
import {
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  departureDateRow,
  lengthOfStayRow,
  licenceExpiryDateRow,
  placementDates,
  preferredPostcodeRow,
  releaseTypeRow,
  requestedOrEstimatedArrivalDateRow,
} from '../match'
import { matchingInformationSummaryRows } from './matchingInformationSummaryList'

type PlacementRequestSummaryListOptions = {
  showActions?: boolean
}

export const placementRequestSummaryList = (
  placementRequest: Cas1PlacementRequestDetail,
  options: PlacementRequestSummaryListOptions = { showActions: true },
): SummaryList => {
  const dates = placementDates(placementRequest.expectedArrival, String(placementRequest.duration))
  const rows: Array<SummaryListItem> = [
    requestedOrEstimatedArrivalDateRow(placementRequest.isParole, dates.startDate),
    departureDateRow(dates.endDate),
    lengthOfStayRow(placementRequest.duration),
    releaseTypeRow(placementRequest),
    licenceExpiryDateRow(placementRequest),
    options.showActions ? apTypeWithViewTimelineActionRow(placementRequest) : apTypeRow(placementRequest.type),
    preferredPostcodeRow(placementRequest.location),
  ]

  if (placementRequest.isWithdrawn) {
    rows.push(withdrawnStatusTag)
  }

  const matchingInformationRows = matchingInformationSummaryRows(placementRequest)
  return { rows: rows.concat(matchingInformationRows) }
}
