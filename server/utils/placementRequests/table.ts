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
  placementRequests.map(placementRequest => {
    const row = [
      nameCell(placementRequest),
      htmlCell(tierBadge(placementRequest.personTier)),
      textCell(placementRequest.isParole ? 'Parole' : 'Standard release'),
    ]

    if (status === 'matched') {
      return [
        ...row,
        textCell(DateFormats.isoDateToUIDate(placementRequest.firstBookingArrivalDate, { format: 'short' })),
        textCell(placementRequest.firstBookingPremisesName),
      ]
    }

    row.push(
      textCell(DateFormats.isoDateToUIDate(placementRequest.applicationSubmittedDate, { format: 'short' })),
      textCell(DateFormats.isoDateToUIDate(placementRequest.requestedPlacementArrivalDate, { format: 'short' })),
      durationCell(placementRequest.requestedPlacementDuration),
    )

    if (status === undefined) {
      row.push(textCell(placementRequestStatus[placementRequest.placementRequestStatus]))
    }

    return row
  })

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

  const columns = [
    sortColumn('Name and CRN', 'person_name'),
    sortColumn('Tier', 'person_risks_tier'),
    sortColumn('Request type', 'request_type'),
  ]

  if (status === 'matched') {
    return [...columns, { text: 'Booked arrival date' }, { text: 'Approved Premises' }]
  }

  columns.push(
    sortColumn('Application date', 'application_date'),
    sortColumn('Requested arrival date', 'expected_arrival'),
    sortColumn('Length of stay', 'duration'),
  )

  if (status === undefined) {
    columns.push({ text: 'Status' })
  }

  return columns
}
