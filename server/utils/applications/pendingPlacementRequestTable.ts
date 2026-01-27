import { ApplicationSortField, Cas1ApplicationSummary, ReleaseTypeOption, SortDirection } from '../../@types/shared'
import { SelectOption, TableCell, TableRow } from '../../@types/ui'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import { allReleaseTypes } from './releaseTypeUtils'
import { createNameAnchorElement, getTierOrBlank } from './helpers'
import { htmlCell, textCell } from '../tableUtils'

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
    sortHeader<ApplicationSortField>('Release Type', 'releaseType', sortBy, sortDirection, hrefPrefix),
  ]
}

export const pendingPlacementRequestTableRows = (applications: Array<Cas1ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application, { showCrn: true }),
    htmlCell(getTierOrBlank(application.risks?.tier?.value?.level)),
    textCell(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
    textCell(application.releaseType ? allReleaseTypes[application.releaseType] : ''),
  ])
}

export const releaseTypeSelectOptions = (selectedOption: ReleaseTypeOption | undefined | null): Array<SelectOption> => {
  const options = Object.entries(allReleaseTypes).map(([releaseType, text]) => ({
    text,
    value: releaseType,
    selected: releaseType === selectedOption,
  }))

  options.unshift({
    text: 'All release types',
    value: '' as ReleaseTypeOption,
    selected: !selectedOption,
  })

  return options
}
