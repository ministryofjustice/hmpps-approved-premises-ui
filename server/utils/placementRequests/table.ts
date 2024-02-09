import { addDays } from 'date-fns'
import {
  PlacementRequest,
  PlacementRequestSortField,
  PlacementRequestStatus,
  PlacementRequestTask,
  SortDirection,
} from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import matchPaths from '../../paths/match'
import adminPaths from '../../paths/admin'
import { DateFormats } from '../dateUtils'
import { linkTo } from '../utils'
import { crnCell, tierCell } from '../tableUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { daysToWeeksAndDays } from '../assessments/dateUtils'
import { sortHeader } from '../sortHeader'
import { isFullPerson, laoName } from '../personUtils'
import { placementRequestStatus } from '../formUtils'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (tasks: Array<PlacementRequestTask>): Array<TableRow> => {
  return tasks.map((task: PlacementRequestTask) => {
    return [
      nameCell(task),
      crnCell(task),
      tierCell(task),
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
      crnCell(placementRequest.person),
      tierCell(placementRequest.risks),
      expectedArrivalDateCell(placementRequest, 'short'),
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

export const dueDateCell = (task: PlacementRequestTask, differenceBetweenDueDateAndArrivalDate: number): TableCell => {
  const dateAsObject = DateFormats.isoToDateObj(task.expectedArrival)

  return {
    text: `${DateFormats.differenceInBusinessDays(
      dateAsObject,
      addDays(dateAsObject, differenceBetweenDueDateAndArrivalDate),
    )} days`,
  }
}

export const expectedArrivalDateCell = (
  item: PlacementRequestTask | PlacementRequest,
  format: 'short' | 'long' = 'long',
): TableCell => ({
  text: DateFormats.isoDateToUIDate(item.expectedArrival, { format }),
})

export const applicationDateCell = (item: PlacementRequest): TableCell => ({
  text: DateFormats.isoDateToUIDate(item.applicationDate, { format: 'short' }),
})

export const nameCell = (item: PlacementRequestTask | PlacementRequest): TableCell => {
  if ('personName' in item && item.personName) {
    return {
      html: linkTo(
        matchPaths.placementRequests.show,
        { id: item.id },
        { text: item.personName, attributes: { 'data-cy-placementRequestId': item.id } },
      ),
    }
  }
  if ('person' in item && item.person && isFullPerson(item.person)) {
    return {
      html: linkTo(
        adminPaths.admin.placementRequests.show,
        { id: item.id },
        { text: laoName(item.person), attributes: { 'data-cy-placementRequestId': item.id } },
      ),
    }
  }

  if ('person' in item && item.person && !isFullPerson(item.person)) {
    return {
      text: `LAO: ${item.person.crn}`,
    }
  }

  return { html: '' }
}

export const releaseTypeCell = (task: PlacementRequestTask) => {
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
    {
      text: 'CRN',
    },
    sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
    sortHeader<PlacementRequestSortField>(
      'Requested arrival date',
      'expected_arrival',
      sortBy,
      sortDirection,
      hrefPrefix,
    ),
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
