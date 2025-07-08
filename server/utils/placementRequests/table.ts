import {
  Cas1PlacementRequestSummary,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
} from '@approved-premises/api'
import { TableCell, TableRow } from '@approved-premises/ui'
import adminPaths from '../../paths/admin'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { linkTo } from '../utils'
import { htmlCell, textCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName, isFullPerson, tierBadge } from '../personUtils'
import { placementRequestStatus } from '../formUtils'

export const dashboardTableRows = (
  placementRequests: Array<Cas1PlacementRequestSummary>,
  status?: PlacementRequestStatus,
): Array<TableRow> =>
  placementRequests.map(placementRequest => [
    nameCell(placementRequest),
    htmlCell(tierBadge(placementRequest.personTier)),
    textCell(DateFormats.isoDateToUIDate(placementRequest.requestedPlacementArrivalDate, { format: 'short' })),
    textCell('N/A'),
    textCell(DateFormats.isoDateToUIDate(placementRequest.applicationSubmittedDate, { format: 'short' })),
    status === 'matched'
      ? textCell(placementRequest.firstBookingPremisesName)
      : durationCell(placementRequest.requestedPlacementDuration),
    textCell(placementRequest.isParole ? 'Parole' : 'Standard release'),
    textCell(placementRequestStatus[placementRequest.placementRequestStatus]),
  ])

export const durationCell = (duration: number): TableCell => {
  return { text: DateFormats.formatDuration(daysToWeeksAndDays(duration), ['weeks', 'days']) }
}

export const nameCell = (placementRequest: Cas1PlacementRequestSummary): TableCell => {
  const name = displayName(placementRequest.person, { showCrn: true })

  if (isFullPerson(placementRequest.person)) {
    return htmlCell(
      linkTo(adminPaths.admin.placementRequests.show({ id: placementRequest.id }), {
        text: name,
        attributes: {
          'data-cy-placementRequestId': placementRequest.id,
          'data-cy-applicationId': placementRequest.applicationId,
        },
      }),
    )
  }

  return textCell(name)
}

export const dashboardTableHeader = (
  status: PlacementRequestStatus,
  sortBy: PlacementRequestSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return [
    sortHeader<PlacementRequestSortField>('Name', 'person_name', sortBy, sortDirection, hrefPrefix),
    sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
    sortHeader<PlacementRequestSortField>(
      'Requested arrival date',
      'expected_arrival',
      sortBy,
      sortDirection,
      hrefPrefix,
    ),
    {
      text: 'Booked arrival date',
    },
    sortHeader<PlacementRequestSortField>('Application date', 'application_date', sortBy, sortDirection, hrefPrefix),
    status === 'matched'
      ? {
          text: 'Approved Premises',
        }
      : sortHeader<PlacementRequestSortField>('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
    sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Status',
    },
  ]
}
