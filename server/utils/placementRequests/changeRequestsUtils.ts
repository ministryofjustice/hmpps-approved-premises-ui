import {
  Cas1ChangeRequestSortField,
  Cas1ChangeRequestSummary,
  Cas1ChangeRequestType,
  SortDirection,
} from '@approved-premises/api'
import { TableCell, TableRow } from '@approved-premises/ui'
import { sortHeader } from '../sortHeader'
import { linkTo } from '../utils'
import adminPaths from '../../paths/admin'
import { displayName, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'

const changeRequestTypeMap: Record<Cas1ChangeRequestType, string> = {
  placementAppeal: 'Appeal',
  placementExtension: 'Extension',
  plannedTransfer: 'Transfer',
}

export const changeRequestsTableHeader = (
  sortBy: Cas1ChangeRequestSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => [
  sortHeader<Cas1ChangeRequestSortField>('Name and CRN', 'name', sortBy, sortDirection, hrefPrefix),
  sortHeader<Cas1ChangeRequestSortField>('Tier', 'tier', sortBy, sortDirection, hrefPrefix),
  sortHeader<Cas1ChangeRequestSortField>('Arrival date', 'canonicalArrivalDate', sortBy, sortDirection, hrefPrefix),
  { text: 'Requested on' },
  { text: 'Change type' },
]

export const changeRequestsTableRows = (changeRequests: Array<Cas1ChangeRequestSummary>): Array<TableRow> =>
  changeRequests.map(changeRequest => [
    nameCell(changeRequest),
    { html: tierBadge(changeRequest.tier) },
    arrivalDateCell(changeRequest),
    { text: DateFormats.isoDateToUIDate(changeRequest.createdAt, { format: 'short' }) },
    { text: changeRequestTypeMap[changeRequest.type] },
  ])

const nameCell = (changeRequest: Cas1ChangeRequestSummary): TableCell => {
  const name = displayName(changeRequest.person)

  return {
    html: linkTo(adminPaths.admin.placementRequests.show({ id: changeRequest.id }), {
      text: `${name}, ${changeRequest.person.crn}`,
    }),
  }
}

const arrivalDateCell = (changeRequest: Cas1ChangeRequestSummary): TableCell => ({
  text: DateFormats.isoDateToUIDate(changeRequest.actualArrivalDate || changeRequest.expectedArrivalDate, {
    format: 'short',
  }),
})
