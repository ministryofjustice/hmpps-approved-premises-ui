import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { withdrawnStatusTag } from '../applications/utils'
import {
  apTypeRow,
  apTypeWithViewTimelineActionRow,
  placementDates,
  requestedOrEstimatedArrivalDateRow,
} from '../match'
import { matchingInformationSummaryRows } from './matchingInformationSummaryList'
import { summaryListItem } from '../formUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { DateFormats } from '../dateUtils'

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

  const isRotl = releaseType === 'rotl' && arrivalFlexible !== undefined

  const rows: Array<SummaryListItem> = [
    requestedOrEstimatedArrivalDateRow(placementRequest.isParole, startDate),
    summaryListItem('Requested departure date', endDate, 'date'),
    isRotl && summaryListItem('Flexible date', arrivalFlexible ? 'Yes' : 'No'),
    summaryListItem('Length of stay', DateFormats.formatDuration(duration)),
    summaryListItem('Release type', allReleaseTypes[releaseType]),
    summaryListItem('Licence expiry date', application?.licenceExpiryDate, 'date'),
    options.showActions ? apTypeWithViewTimelineActionRow(placementRequest) : apTypeRow(placementRequest.type),
    summaryListItem('Preferred postcode', location),
    placementRequest.isWithdrawn && withdrawnStatusTag,
  ].filter(Boolean)

  const matchingInformationRows = matchingInformationSummaryRows(placementRequest)
  return { rows: rows.concat(matchingInformationRows) }
}
