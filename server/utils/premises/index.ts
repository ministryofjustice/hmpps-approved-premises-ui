import type {
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  FullPerson,
  SortDirection,
} from '@approved-premises/api'
import { SelectGroup, SelectOption, SummaryList, TableCell, TableRow } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { getTierOrBlank, htmlValue, textValue } from '../applications/helpers'
import managePaths from '../../paths/manage'
import { createQueryString, linkTo } from '../utils'
import { TabItem } from '../tasks/listTable'
import { sortHeader } from '../sortHeader'
import { laoName } from '../personUtils'

export { premisesActions } from './premisesActions'

export const summaryListForPremises = (premises: Cas1PremisesSummary): SummaryList => {
  return {
    rows: [
      {
        key: textValue('Code'),
        value: textValue(premises.apCode),
      },
      {
        key: textValue('Postcode'),
        value: textValue(premises.postcode),
      },
      {
        key: textValue('Number of Beds'),
        value: textValue(premises.bedCount.toString()),
      },
      {
        key: textValue('Available Beds'),
        value: textValue(premises.availableBeds.toString()),
      },
      {
        key: textValue('Out of Service Beds'),
        value: textValue(premises.outOfServiceBeds.toString()),
      },
    ],
  }
}

export const groupCas1SummaryPremisesSelectOptions = (
  premises: Array<Cas1PremisesBasicSummary>,
  context: Record<string, unknown>,
  fieldName: string = 'premisesId',
): Array<SelectGroup> => {
  const apAreas = premises.reduce((map, { apArea }) => {
    map[apArea.id] = apArea
    return map
  }, {})
  return Object.values(apAreas).map(({ id, name }) => ({
    label: name,
    items: premises
      .filter(item => item.apArea.id === id)
      .map(item => ({
        text: item.name,
        value: item.id,
        selected: context[fieldName] === item.id,
      })),
  }))
}

export const cas1PremisesSummaryRadioOptions = (
  premises: Array<Cas1PremisesBasicSummary>,
  context: Record<string, unknown>,
  fieldName: string = 'premisesId',
): Array<SelectOption> =>
  premises.map(({ id, name, apArea }) => {
    return {
      value: id,
      text: `${name} (${apArea.name})`,
      selected: context[fieldName] === id,
    }
  })

export const premisesTableRows = (premisesSummaries: Array<Cas1PremisesBasicSummary>) => {
  return premisesSummaries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p: Cas1PremisesBasicSummary) => {
      return [
        textValue(p.name),
        textValue(p.apCode),
        textValue(p.bedCount.toString()),
        htmlValue(
          linkTo(managePaths.premises.show, { premisesId: p.id }, { text: 'View', hiddenText: `about ${p.name}` }),
        ),
      ]
    })
}

export const tabTextMap: Record<Cas1SpaceBookingResidency, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  historic: 'Historical',
}

export const premisesTabItems = (premises: Cas1PremisesSummary, activeTab?: string): Array<TabItem> => {
  const getSelfLink = (tab: string): string =>
    `${managePaths.premises.show({ premisesId: premises.id })}${createQueryString(
      {
        activeTab: tab,
      },
      { addQueryPrefix: true },
    )}`
}
return [
  {
    text: 'Upcoming',
    active: activeTab === 'upcoming',
    href: getSelfLink('upcoming'),
  },
  {
    text: 'Current',
    active: activeTab === 'current',
    href: getSelfLink('current'),
  },
  {
    text: 'Historical',
    active: activeTab === 'historical',
    href: getSelfLink('historical'),
  },
]

type ColumnDefinition = {
  title: string
  fieldName: Cas1SpaceBookingSummarySortField
}
const baseColumns: Array<ColumnDefinition> = [
  { title: 'Name and CRN', fieldName: 'personName' },
  { title: 'Tier', fieldName: 'tier' },
  { title: 'Arrival date', fieldName: 'canonicalArrivalDate' },
  { title: 'Departure date', fieldName: 'canonicalDepartureDate' },
]
const keyWorkerColumn: ColumnDefinition = { title: 'Key worker', fieldName: 'keyWorkerName' }

const columnMap: Record<Cas1SpaceBookingResidency, Array<ColumnDefinition>> = {
  upcoming: [...baseColumns, keyWorkerColumn],
  current: [...baseColumns, keyWorkerColumn],
  historic: baseColumns,
}

export const placementTableHeader = (
  activeTab: string,
  sortBy: Cas1SpaceBookingSummarySortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return columnMap[activeTab].map(({ title, fieldName }: ColumnDefinition) =>
    sortHeader<Cas1SpaceBookingSummarySortField>(title, fieldName, sortBy, sortDirection, hrefPrefix),
  )
}

export const placementTableRows = (premisesId: string, placements: Array<Cas1SpaceBookingSummary>): Array<TableRow> =>
  placements.map(({ id, person, tier, canonicalArrivalDate, canonicalDepartureDate, keyWorkerAllocation }) => [
    htmlValue(
      `<a href="${managePaths.premises.placements.show({ premisesId, placementId: id })}" data-cy-id="${id}">${laoName(person as unknown as FullPerson)}, ${person.crn}</a>`,
    ),
    htmlValue(getTierOrBlank(tier)),
    textValue(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' })),
    textValue(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' })),
    textValue(keyWorkerAllocation?.keyWorker?.name),
  ])
