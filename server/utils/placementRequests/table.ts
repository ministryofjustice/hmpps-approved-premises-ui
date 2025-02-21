import { addDays } from 'date-fns'
import { PlacementRequest, PlacementRequestSortField, PlacementRequestStatus, SortDirection } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import adminPaths from '../../paths/admin'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { linkTo } from '../utils'
import { crnCell, tierCell } from '../tableUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { sortHeader } from '../sortHeader'
import { displayName, isFullPerson } from '../personUtils'
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
  placementRequests: Array<PlacementRequest>,
  status: PlacementRequestStatus | undefined,
): Array<TableRow> => {
  return placementRequests.map((placementRequest: PlacementRequest) => {
    return [
      nameCell(placementRequest),
      tierCell(placementRequest.risks),
      expectedArrivalDateCell(placementRequest, 'short'),
      actualArrivalDateCell(placementRequest),
      applicationDateCell(placementRequest),
      status === 'matched' ? premisesNameCell(placementRequest) : durationCell(placementRequest),
      requestTypeCell(placementRequest),
      statusCell(placementRequest),
    ]
  })
}

export const statusCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    text: placementRequestStatus[placementRequest.status],
  }
}

export const requestTypeCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    text: placementRequest.isParole ? 'Parole' : 'Standard release',
  }
}

export const premisesNameCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    text: placementRequest.booking?.premisesName,
  }
}

export const durationCell = (placementRequest: PlacementRequest): TableCell => {
  return { text: DateFormats.formatDuration(daysToWeeksAndDays(placementRequest.duration), ['weeks', 'days']) }
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

export const actualArrivalDateCell = (item: PlacementRequest): TableCell => ({
  text: item.booking?.arrivalDate ? DateFormats.isoDateToUIDate(item.booking?.arrivalDate, { format: 'short' }) : 'N/A',
})

export const applicationDateCell = (item: PlacementRequest): TableCell => ({
  text: DateFormats.isoDateToUIDate(item.applicationDate, { format: 'short' }),
})

export const nameCell = (item: PlacementRequest): TableCell => {
  const name = displayName(item.person, true)

  if (isFullPerson(item.person)) {
    return {
      html: linkTo(adminPaths.admin.placementRequests.show({ id: item.id }), {
        text: name,
        attributes: { 'data-cy-placementRequestId': item.id, 'data-cy-applicationId': item.applicationId },
      }),
    }
  }

  return {
    text: name,
  }
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
      text: 'Actual arrival date',
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
