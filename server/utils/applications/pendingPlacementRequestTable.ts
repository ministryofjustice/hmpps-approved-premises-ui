import {
  ApplicationSortField,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ReleaseTypeOption,
  SortDirection,
} from '../../@types/shared'
import { SelectOption, TableCell, TableRow } from '../../@types/ui'
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
    sortHeader<ApplicationSortField>('Release Type', 'releaseType', sortBy, sortDirection, hrefPrefix),
  ]
}

export const pendingPlacementRequestTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application, { showCrn: true }),
    htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
    textValue(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
    textValue(application.releaseType ? allReleaseTypes[application.releaseType] : ''),
  ])
}

export const releaseTypeSelectOptions = (selectedOption: ReleaseTypeOption | undefined | null): Array<SelectOption> => {
  const options = Object.keys(allReleaseTypes).map(releaseType => ({
    text: allReleaseTypes[releaseType],
    value: releaseType,
    selected: releaseType === selectedOption,
  }))

  options.unshift({
    text: 'All release types',
    value: '',
    selected: !selectedOption,
  })

  return options
}
