import type {
  Cas1OverbookingRange,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  NamedId,
  SortDirection,
} from '@approved-premises/api'
import { DateRange, SelectGroup, SelectOption, SummaryList, TableCell, TableRow } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { getTierOrBlank, htmlValue, textValue } from '../applications/helpers'
import managePaths from '../../paths/manage'
import { createQueryString, linkTo } from '../utils'
import { TabItem } from '../tasks/listTable'
import { sortHeader } from '../sortHeader'
import { displayName } from '../personUtils'
import { canonicalDates, placementStatusHtml } from '../placements'

export { premisesActions } from './premisesActions'

export const summaryListForPremises = (premises: Cas1Premises): SummaryList => {
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
      premises.supportsSpaceBookings
        ? {
            key: textValue('Available Beds'),
            value: textValue(premises.availableBeds.toString()),
          }
        : null,
      {
        key: textValue('Out of Service Beds'),
        value: textValue(premises.outOfServiceBeds.toString()),
      },
    ].filter(Boolean),
  }
}

export const groupCas1SummaryPremisesSelectOptions = (
  premises: Array<Cas1PremisesBasicSummary>,
  context: Record<string, unknown>,
  fieldName: string = 'premisesId',
): Array<SelectGroup> => {
  const apAreas = premises.reduce(
    (map, { apArea }) => {
      map[apArea.id] = apArea
      return map
    },
    {} as Record<string, NamedId>,
  )
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

export const premisesTableHead: TableRow = [
  {
    text: 'Name',
  },
  {
    text: 'Code',
  },
  {
    text: 'Number of beds',
    format: 'numeric',
  },
]

export const premisesTableRows = (premisesSummaries: Array<Cas1PremisesBasicSummary>): Array<TableRow> =>
  premisesSummaries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p: Cas1PremisesBasicSummary) => {
      return [
        htmlValue(linkTo(managePaths.premises.show({ premisesId: p.id }), { text: p.name })),
        textValue(p.apCode),
        { ...textValue(p.bedCount.toString()), format: 'numeric' },
      ]
    })

export type PremisesTab = Cas1SpaceBookingResidency | 'search'

export const tabTextMap: Record<PremisesTab, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  historic: 'Historical',
  search: 'Search for a booking',
}

export const premisesTabItems = (premises: Cas1Premises, activeTab?: PremisesTab): Array<TabItem> => {
  const getSelfLink = (tab: string): string =>
    `${managePaths.premises.show({ premisesId: premises.id })}?${createQueryString({
      activeTab: tab,
    })}`
  return Object.entries(tabTextMap).map(([key, label]) => {
    return { text: label, active: activeTab === key, href: getSelfLink(key) }
  })
}

type ColumnField = Cas1SpaceBookingSummarySortField | 'status'

type ColumnDefinition = {
  title: string
  fieldName: ColumnField
  sortable: boolean
}
const baseColumns: Array<ColumnDefinition> = [
  { title: 'Name and CRN', fieldName: 'personName', sortable: true },
  { title: 'Tier', fieldName: 'tier', sortable: true },
  { title: 'Arrival date', fieldName: 'canonicalArrivalDate', sortable: true },
  { title: 'Departure date', fieldName: 'canonicalDepartureDate', sortable: true },
]
const statusColumn: ColumnDefinition = { title: 'Status', fieldName: 'status', sortable: false }
const keyWorkerColumn: ColumnDefinition = { title: 'Key worker', fieldName: 'keyWorkerName', sortable: true }

const columnMap: Record<PremisesTab, Array<ColumnDefinition>> = {
  upcoming: [...baseColumns, keyWorkerColumn, statusColumn],
  current: [...baseColumns, keyWorkerColumn, statusColumn],
  historic: [...baseColumns, statusColumn],
  search: [...baseColumns, keyWorkerColumn, statusColumn],
}

export const placementTableHeader = (
  activeTab: PremisesTab,
  sortBy: Cas1SpaceBookingSummarySortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return columnMap[activeTab].map(({ title, fieldName, sortable }: ColumnDefinition) =>
    sortable ? sortHeader<ColumnField>(title, fieldName, sortBy, sortDirection, hrefPrefix) : textValue(title),
  )
}

export const placementTableRows = (
  activeTab: PremisesTab,
  premisesId: string,
  placements: Array<Cas1SpaceBookingSummary>,
): Array<TableRow> =>
  placements.map(placement => {
    const { id, person, tier, keyWorkerAllocation } = placement
    const { arrivalDate, departureDate } = canonicalDates(placement)
    const fieldValues: Record<ColumnField, TableCell> = {
      personName: htmlValue(
        `<a href="${managePaths.premises.placements.show({
          premisesId,
          placementId: id,
        })}" data-cy-id="${id}">${displayName(person)}, ${person.crn}</a>`,
      ),
      tier: htmlValue(getTierOrBlank(tier)),
      canonicalArrivalDate: textValue(DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })),
      canonicalDepartureDate: textValue(DateFormats.isoDateToUIDate(departureDate, { format: 'short' })),
      keyWorkerName: textValue(keyWorkerAllocation?.keyWorker?.name || 'Not assigned'),
      status: placementStatusHtml(placement),
    }

    return columnMap[activeTab].map(({ fieldName }: ColumnDefinition) => fieldValues[fieldName])
  })

export const premisesOverbookingSummary = (premises: Cas1Premises): Array<DateRange> => {
  const { overbookingSummary } = premises
  return overbookingSummary.map(({ startInclusive, endInclusive }: Cas1OverbookingRange) => ({
    from: startInclusive,
    to: endInclusive,
    duration: DateFormats.durationBetweenDates(endInclusive, startInclusive).number + 1,
  }))
}
