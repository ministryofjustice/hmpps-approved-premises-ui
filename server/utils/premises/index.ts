import type {
  Cas1CurrentKeyWorker,
  Cas1Premises,
  Cas1PremisesBasicSummary,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummarySortField,
  NamedId,
  SortDirection,
} from '@approved-premises/api'
import {
  RequestWithSession,
  SelectGroup,
  SelectOption,
  SummaryList,
  TabItem,
  TableCell,
  TableRow,
} from '@approved-premises/ui'
import { Request } from 'express'
import { getTierOrBlank } from '../applications/helpers'
import managePaths from '../../paths/manage'
import { createQueryString, linkTo } from '../utils'
import { sortHeader } from '../sortHeader'
import { displayName } from '../personUtils'
import { canonicalDates, placementStatusCell } from '../placements'
import { dateCell, htmlCell, textCell } from '../tableUtils'
import { getRoomCharacteristicLabel } from '../characteristicsUtils'
import { getPlacementLink } from '../resident'

export { premisesActions } from './premisesActions'

export const summaryListForPremises = (premises: Cas1Premises): SummaryList => {
  return {
    rows: [
      {
        key: textCell('Code'),
        value: textCell(premises.apCode),
      },
      {
        key: textCell('Postcode'),
        value: textCell(premises.postcode),
      },
      {
        key: textCell('Number of Beds'),
        value: textCell(premises.bedCount.toString()),
      },
      premises.supportsSpaceBookings
        ? {
            key: textCell('Available Beds'),
            value: textCell(premises.availableBeds.toString()),
          }
        : null,
      {
        key: textCell('Out of Service Beds'),
        value: textCell(premises.outOfServiceBeds.toString()),
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
  textCell('Name'),
  textCell('Code'),
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
        htmlCell(linkTo(managePaths.premises.show({ premisesId: p.id }), { text: p.name })),
        textCell(p.apCode),
        { ...textCell(p.bedCount.toString()), format: 'numeric' },
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

export const keyworkersToSelectOptions = (
  currentKeyworkers: Array<Cas1CurrentKeyWorker>,
  activeTab: PremisesTab,
  selected?: string,
): Array<SelectOption> => [
  { text: 'All keyworkers', value: '' },
  ...currentKeyworkers
    .filter(
      keyworker =>
        (activeTab === 'upcoming' && keyworker.upcomingBookingCount > 0) ||
        (activeTab === 'current' && keyworker.currentBookingCount > 0),
    )
    .map(keyworker => ({
      text: keyworker.summary.name,
      value: keyworker.summary.id,
      selected: selected === keyworker.summary.id || undefined,
    })),
]

type ColumnField = Cas1SpaceBookingSummarySortField | 'status' | 'spaceType'

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
    sortable ? sortHeader<ColumnField>(title, fieldName, sortBy, sortDirection, hrefPrefix) : textCell(title),
  )
}

export const placementTableRows = (
  activeTab: PremisesTab,
  premisesId: string,
  placements: Array<Cas1SpaceBookingSummary>,
  request?: Request,
): Array<TableRow> => {
  return mapPlacementTableRows(columnMap[activeTab], premisesId, placements, request)
}

export const mapPlacementTableRows = (
  fields: Array<ColumnDefinition>,
  premisesId: string,
  placements: Array<Cas1SpaceBookingSummary>,
  request: RequestWithSession,
): Array<TableRow> =>
  placements.map(placement => {
    const { id, person, tier, keyWorkerAllocation, characteristics } = placement
    const { arrivalDate, departureDate } = canonicalDates(placement)
    const link = getPlacementLink({ request, premisesId, person, placementId: placement.id })
    const fieldValues: Record<ColumnField, TableCell> = {
      personName: htmlCell(`<a href="${link}" data-cy-id="${id}">${displayName(person)}, ${person.crn}</a>`),
      tier: htmlCell(getTierOrBlank(tier)),
      canonicalArrivalDate: dateCell(arrivalDate),
      canonicalDepartureDate: dateCell(departureDate),
      keyWorkerName: textCell(keyWorkerAllocation?.name || 'Not assigned'),
      status: placementStatusCell(placement),
      spaceType: htmlCell(
        `<ul class="govuk-list govuk-list--compact">${characteristics
          .map(characteristic => getRoomCharacteristicLabel(characteristic))
          .filter(Boolean)
          .map((item: string) => `<li>${item}</li>`)
          .join('')}</ul>`,
      ),
    }

    return fields.map(({ fieldName }: ColumnDefinition) => fieldValues[fieldName])
  })

export const localRestrictionsTableRows = (premises: Cas1Premises): Array<TableRow> =>
  premises.localRestrictions.map(restriction => [
    textCell(restriction.description),
    dateCell(restriction.createdAt),
    htmlCell(
      linkTo(
        managePaths.premises.localRestrictions.remove({
          premisesId: premises.id,
          restrictionId: restriction.id,
        }),
        {
          text: 'Remove',
          hiddenText: `restriction "${restriction.description}"`,
          attributes: { class: 'govuk-button govuk-button--secondary govuk-!-margin-0' },
        },
      ),
    ),
  ])
