import { addDays } from 'date-fns'
import {
  Cas1PlacementRequestSummary,
  PlacementRequest,
  PlacementRequestSortField,
  PlacementRequestStatus,
  SortDirection,
} from '@approved-premises/api'
import { TableCell, TableRow } from '@approved-premises/ui'
import adminPaths from '../../paths/admin'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { linkTo } from '../utils'
import { crnCell, htmlCell, textCell, tierCell } from '../tableUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { sortHeader } from '../sortHeader'
import { displayName, isFullPerson, tierBadge } from '../personUtils'
import { placementRequestStatus } from '../formUtils'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (tasks: Array<PlacementRequest>): Array<TableRow> => {
  return tasks.map((task: PlacementRequest) => {
    return [
      nameCell(task),
      crnCell(task.person),
      tierCell(task.risks),
      expectedArrivalDateCell(task),
      dueDateCell(task, DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE),
      releaseTypeCell(task),
    ]
  })
}

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

export const dueDateCell = (task: PlacementRequest, differenceBetweenDueDateAndArrivalDate: number): TableCell => {
  const dateAsObject = DateFormats.isoToDateObj(task.expectedArrival)

  return {
    text: `${DateFormats.differenceInBusinessDays(
      dateAsObject,
      addDays(dateAsObject, differenceBetweenDueDateAndArrivalDate),
    )} days`,
  }
}

export const expectedArrivalDateCell = (item: PlacementRequest, format: 'short' | 'long' = 'long'): TableCell => ({
  text: DateFormats.isoDateToUIDate(item.expectedArrival, { format }),
})

export const nameCell = (item: PlacementRequest | Cas1PlacementRequestSummary): TableCell => {
  const name = displayName(item.person, { showCrn: true })

  if (isFullPerson(item.person)) {
    return htmlCell(
      linkTo(adminPaths.admin.placementRequests.show({ id: item.id }), {
        text: name,
        attributes: { 'data-cy-placementRequestId': item.id, 'data-cy-applicationId': item.applicationId },
      }),
    )
  }

  return textCell(name)
}

export const releaseTypeCell = (task: PlacementRequest) => {
  return {
    text: allReleaseTypes[task.releaseType],
  }
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
