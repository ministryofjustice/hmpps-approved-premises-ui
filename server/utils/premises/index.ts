import type {
  Cas1PremisesBasicSummary,
  Cas1PremisesSummary,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  DateCapacity,
  PersonSummary,
  SortDirection,
} from '@approved-premises/api'
import { BedOccupancyRangeUi, SelectGroup, SelectOption, SummaryList, TableCell, TableRow } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { addOverbookingsToSchedule } from '../addOverbookingsToSchedule'
import { getTierOrBlank, htmlValue, textValue } from '../applications/helpers'
import { premisesActions } from './premisesActions'
import managePaths from '../../paths/manage'
import { createQueryString, linkTo } from '../utils'
import { TabItem } from '../tasks/listTable'
import { sortHeader } from '../sortHeader'

export { premisesActions } from './premisesActions'

export type NegativeDateRange = { start?: string; end?: string }

export interface PersonWithName extends PersonSummary {
  name: string
}

export const overcapacityMessage = (premisesCapacity: Array<DateCapacity> = []): string => {
  let dateRange: NegativeDateRange = {}
  const overcapacityDateRanges: Array<NegativeDateRange> = []
  let message: string

  premisesCapacity.forEach((premisesCapacityItem, i, arr) => {
    if (premisesCapacityItem.availableBeds < 0 && !dateRange?.start) {
      dateRange.start = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds < 0 && dateRange.start) {
      dateRange.end = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds >= 0 && dateRange.start) {
      overcapacityDateRanges.push(dateRange)
      dateRange = {}
    }
    if (arr.length === i + 1 && dateRange.start) {
      overcapacityDateRanges.push(dateRange)
    }
  })

  if (overcapacityDateRanges.length === 1) {
    if (!overcapacityDateRanges[0].end) {
      return `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on ${DateFormats.isoDateToUIDate(
        overcapacityDateRanges[0].start,
      )}</h3>`
    }
    message = `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period ${DateFormats.isoDateToUIDate(
      overcapacityDateRanges[0].start,
    )} to ${DateFormats.isoDateToUIDate(overcapacityDateRanges[0].end)}</h3>`
  }

  if (overcapacityDateRanges.length > 1) {
    const dateRanges = overcapacityDateRanges
      .map((range: NegativeDateRange) =>
        !range.end
          ? `<li>${DateFormats.isoDateToUIDate(range.start)}</li>`
          : `<li>${DateFormats.isoDateToUIDate(range.start)} to ${DateFormats.isoDateToUIDate(range.end)}</li>`,
      )
      .join('')
    message = `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h3>
      <ul class="govuk-list govuk-list--bullet">${dateRanges}</ul>`
  }

  return message
}

export const mapApiOccupancyToUiOccupancy = async (bedOccupancyRangeList: Array<BedOccupancyRange>) => {
  const mappedOccupancyList = await Promise.all(
    bedOccupancyRangeList.map(async occupancyRange => {
      const mappedEntry = await mapApiOccupancyEntryToUiOccupancyEntry(occupancyRange)
      return mappedEntry
    }),
  )

  const occupancyListWithOverBookings = mappedOccupancyList.map(item => ({
    ...item,
    schedule: addOverbookingsToSchedule(item.schedule),
  }))

  return occupancyListWithOverBookings
}

export const mapApiOccupancyEntryToUiOccupancyEntry = async (
  bedOccupancyRangeList: BedOccupancyRange,
): Promise<BedOccupancyRangeUi> => {
  return {
    ...bedOccupancyRangeList,
    schedule: bedOccupancyRangeList.schedule.map(scheduleEntry => {
      return {
        ...scheduleEntry,
        startDate: DateFormats.isoToDateObj(scheduleEntry.startDate),
        endDate: DateFormats.isoToDateObj(scheduleEntry.endDate),
      }
    }),
  } as BedOccupancyRangeUi
}
>>>>>>> 6dff7c56 (Fix person name type issue)

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

type TabKey = 'upcoming' | 'current' | 'historical'

export const premisesTabItems = (premises: Cas1PremisesSummary, activeTab?: string): Array<TabItem> => {
  const getSelfLink = (tab: string): string =>
    `${managePaths.premises.show({ premisesId: premises.id })}${createQueryString(
      {
        activeTab: tab,
      },
      { addQueryPrefix: true },
    )}`
  const tabs: Array<{
    label: string
    key: TabKey
  }> = [
    { label: 'Upcoming', key: 'upcoming' },
    { label: 'Current', key: 'current' },
    { label: 'Historical', key: 'historical' },
  ]
  return tabs.map(({ label, key }) => {
    return { text: label, active: activeTab === key, href: getSelfLink(key) }
  })
}

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

const columnMap: Record<TabKey, Array<ColumnDefinition>> = {
  upcoming: [...baseColumns, keyWorkerColumn],
  current: [...baseColumns, keyWorkerColumn],
  historical: baseColumns,
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

export const placementTableRows = (
  activeTab: string,
  premisesId: string,
  placements: Array<Cas1SpaceBookingSummary>,
): Array<TableRow> =>
  placements.map(({ id, person, tier, canonicalArrivalDate, canonicalDepartureDate, keyWorkerAllocation }) => [
    htmlValue(
      `<a href="${managePaths.premises.placements.show({ premisesId, bookingId: id })}" data-cy-id="${id}">${(person as PersonWithName).name}, ${person.crn}</a>`,
    ),
    htmlValue(getTierOrBlank(tier)),
    textValue(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' })),
    textValue(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' })),
    textValue(keyWorkerAllocation?.keyWorker?.name),
  ])
