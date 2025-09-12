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
import { dateCell, htmlCell, textCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName, isFullPerson, tierBadge } from '../personUtils'
import { placementRequestStatus } from '../formUtils'

export const dashboardTableRows = (
  placementRequests: Array<Cas1PlacementRequestSummary>,
  status?: PlacementRequestStatus,
): Array<TableRow> =>
  placementRequests.map(placementRequest =>
    [
      nameCell(placementRequest),
      htmlCell(tierBadge(placementRequest.personTier)),
      textCell(placementRequest.isParole ? 'Parole' : 'Standard release'),
      status === 'matched' && dateCell(placementRequest.firstBookingArrivalDate),
      status === 'matched' && textCell(placementRequest.firstBookingPremisesName),
      status !== 'matched' && dateCell(placementRequest.applicationSubmittedDate),
      status !== 'matched' && dateCell(placementRequest.requestedPlacementArrivalDate),
      status !== 'matched' && durationCell(placementRequest.requestedPlacementDuration),
      status === undefined && textCell(placementRequestStatus[placementRequest.placementRequestStatus]),
    ].filter(Boolean),
  )

export const durationCell = (duration: number): TableCell => {
  return { text: DateFormats.formatDuration(daysToWeeksAndDays(duration), ['weeks', 'days']) }
}

export const nameCell = (placementRequest: Cas1PlacementRequestSummary): TableCell => {
  if (isFullPerson(placementRequest.person)) {
    return htmlCell(
      linkTo(adminPaths.admin.placementRequests.show({ placementRequestId: placementRequest.id }), {
        text: `${displayName(placementRequest.person)}, ${placementRequest.person.crn}`,
        attributes: {
          'data-cy-placementRequestId': placementRequest.id,
          'data-cy-applicationId': placementRequest.applicationId,
        },
      }),
    )
  }

  return textCell(displayName(placementRequest.person, { showCrn: true }))
}

export const dashboardTableHeader = (
  status: PlacementRequestStatus,
  sortBy: PlacementRequestSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  const sortColumn = (label: string, sortableBy: PlacementRequestSortField) =>
    sortHeader<PlacementRequestSortField>(label, sortableBy, sortBy, sortDirection, hrefPrefix)

  return [
    sortColumn('Name and CRN', 'person_name'),
    sortColumn('Tier', 'person_risks_tier'),
    sortColumn('Request type', 'request_type'),
    status === 'matched' && sortColumn('Booked arrival date', 'canonical_arrival_date'),
    status === 'matched' && sortColumn('Approved Premises', 'name'),
    status !== 'matched' && sortColumn('Application date', 'application_date'),
    status !== 'matched' && sortColumn('Requested arrival date', 'expected_arrival'),
    status !== 'matched' && sortColumn('Length of stay', 'duration'),
    status === undefined && { text: 'Status' },
  ].filter(Boolean)
}
