import {
  ApplicationSortField,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  SortDirection,
} from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import { allReleaseTypes } from './releaseTypeUtils'
import { createNameAnchorElement, getTierOrBlank, htmlValue, textValue } from './helpers'

export const pendingPlacementRequestTableHeader = (
  sortBy: ApplicationSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return [
    {
      text: 'Name',
    },
    sortHeader<ApplicationSortField>('Tier', 'tier', sortBy, sortDirection, hrefPrefix),
    sortHeader<ApplicationSortField>('Date of application', 'createdAt', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Release Type',
    },
  ]
}

export const pendingPlacementRequestTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application),
    htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
    textValue(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
    textValue(application.releaseType ? allReleaseTypes[application.releaseType] : ''),
  ])
}
