import {
  Cas1OutOfServiceBedSummary,
  Cas1PremiseCapacityForDay,
  Cas1PremisesDaySummary,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummarySortField,
  Cas1SpaceBookingSummary,
  SortDirection,
} from '@approved-premises/api'
import { SelectOption, SummaryListItem, TableCell, TableRow } from '@approved-premises/ui'
import { Request } from 'express'
import { DateFormats } from '../dateUtils'
import managePaths from '../../paths/manage'
import { summaryListItem } from '../formUtils'
import { sortHeader } from '../sortHeader'
import { joinWithCommas, pluralize } from '../utils'
import { placementCriteriaLabels } from '../placementCriteriaUtils'
import { getRoomCharacteristicLabel, roomCharacteristicMap } from '../characteristicsUtils'
import { mapPlacementTableRows } from './index'
import { htmlCell, textCell } from '../tableUtils'

type CalendarDayStatus = 'available' | 'full' | 'overbooked'

type CalendarDay = {
  name: string
  status: CalendarDayStatus
  availability: number
  booked: number
  criteriaBookableCount?: number
  link: string
}
type CalendarMonth = {
  name: string
  days: Array<CalendarDay>
}
export type Calendar = Array<CalendarMonth>
const statusMap: Record<string, CalendarDayStatus> = { '-1': 'overbooked', '0': 'full', '1': 'available' }

export const dayStatusFromDayCapacity = ({
  bookingCount,
  availableBedCount,
  characteristicAvailability,
}: Cas1PremiseCapacityForDay): CalendarDayStatus => {
  let dayStatus: CalendarDayStatus = statusMap[Math.sign(availableBedCount - bookingCount)]
  characteristicAvailability.forEach(({ availableBedsCount, bookingsCount }) => {
    dayStatus = bookingsCount > availableBedsCount ? 'overbooked' : dayStatus
  })
  return dayStatus
}

export const occupancyCalendar = (capacity: Array<Cas1PremiseCapacityForDay>, premisesId: string): Calendar => {
  return capacity.reduce<Calendar>((calendar, dayCapacity) => {
    const { availableBedCount, bookingCount, date } = dayCapacity
    const monthAndYear = DateFormats.isoDateToMonthAndYear(date)
    let currentMonth = calendar.find(month => month.name === monthAndYear)

    if (!currentMonth) {
      currentMonth = {
        name: monthAndYear,
        days: [],
      }
      calendar.push(currentMonth)
    }

    const calendarDay: CalendarDay = {
      name: DateFormats.isoDateToUIDate(date, { format: 'longNoYear' }),
      status: dayStatusFromDayCapacity(dayCapacity),
      availability: availableBedCount - bookingCount,
      booked: bookingCount,
      link: managePaths.premises.occupancy.day({ premisesId, date }),
    }

    currentMonth.days.push(calendarDay)

    return calendar
  }, [])
}

const durationOptionsMap: Record<number, string> = {
  '7': '1 week',
  '42': '6 weeks',
  '56': '8 weeks',
  '84': '12 weeks',
  '182': '26 weeks',
  '364': '52 weeks',
}

export const durationSelectOptions = (durationDays?: string): Array<SelectOption> =>
  Object.entries(durationOptionsMap).map(([value, label]) => ({
    value,
    text: label,
    selected: value === durationDays || undefined,
  }))

export const generateDaySummaryText = (capacity: Cas1PremiseCapacityForDay): string => {
  const { characteristicAvailability, availableBedCount, bookingCount } = capacity

  const overbookedCriteria = characteristicAvailability
    .map(({ characteristic, availableBedsCount, bookingsCount }) =>
      bookingsCount > availableBedsCount ? characteristic : undefined,
    )
    .filter(Boolean)
  const messages: Array<string> = []
  if (bookingCount > availableBedCount) messages.push('is overbooked')
  if (overbookedCriteria.length)
    messages.push(
      `is overbooked on: ${joinWithCommas(overbookedCriteria.map(characteristic => roomCharacteristicMap[characteristic].toLowerCase()))}`,
    )
  return messages.length ? `This AP ${messages.join(' and ')}.` : ''
}

const availabilityRow = (name: string, available: number, booked: number, hideEmpty: boolean): SummaryListItem => {
  return booked || available || !hideEmpty
    ? {
        key: { text: name },
        value: {
          html: `<div class="govuk-grid-row govuk-grid-row--flex"><div class="govuk-grid-column-one-third">${available} capacity</div><div class="govuk-grid-column-one-third">${booked} booked</div><div class="govuk-grid-column-one-third">${available - booked} available</div></div>`,
        },
      }
    : null
}

export const daySummaryRows = (
  capacity: Cas1PremiseCapacityForDay,
  roomCharacteristics: Array<Cas1SpaceBookingCharacteristic> = null,
  characteristicsMode: 'singleRow' | 'doubleRow' | 'none' = 'none',
) => {
  const { totalBedCount, bookingCount, availableBedCount, characteristicAvailability } = capacity

  const rows: Array<SummaryListItem> = [
    summaryListItem('Capacity', String(totalBedCount)),
    summaryListItem('Booked spaces', String(bookingCount)),
    summaryListItem('Out of service beds', String(totalBedCount - availableBedCount)),
    summaryListItem('Available spaces', String(availableBedCount - bookingCount)),
  ]

  if (characteristicsMode === 'doubleRow')
    rows.push({ key: { html: '<div class="govuk-!-static-padding-top-5"></div>' }, value: null })

  if (characteristicsMode !== 'none')
    characteristicAvailability.forEach(({ characteristic, availableBedsCount, bookingsCount }) => {
      if (!roomCharacteristics || roomCharacteristics.includes(characteristic)) {
        if (characteristicsMode === 'singleRow') {
          rows.push(
            availabilityRow(
              placementCriteriaLabels[characteristic],
              availableBedsCount,
              bookingsCount,
              !roomCharacteristics,
            ),
          )
        }

        if (characteristicsMode === 'doubleRow') {
          rows.push(summaryListItem(`${placementCriteriaLabels[characteristic]} capacity`, String(availableBedsCount)))
          rows.push(
            summaryListItem(
              `${placementCriteriaLabels[characteristic]} available`,
              String(availableBedsCount - bookingsCount),
            ),
          )
        }
      }
    })

  return { rows }
}

export const filterOutOfServiceBeds = (
  daySummary: Cas1PremisesDaySummary,
  characteristicsArray?: Array<Cas1SpaceBookingCharacteristic>,
): Cas1PremisesDaySummary => {
  const outOfServiceBeds =
    characteristicsArray && characteristicsArray.length
      ? daySummary.outOfServiceBeds.filter(({ characteristics }) =>
          characteristicsArray.some(characteristic => characteristics.includes(characteristic)),
        )
      : daySummary.outOfServiceBeds
  return { ...daySummary, outOfServiceBeds }
}

export const tableCaptions = (
  daySummary: Cas1PremisesDaySummary,
  characteristicsArray: Array<Cas1SpaceBookingCharacteristic>,
  detailedFormat = false,
): { placementTableCaption: string; outOfServiceBedCaption: string } => {
  const formattedDate = DateFormats.isoDateToUIDate(daySummary.forDate)
  return detailedFormat
    ? {
        placementTableCaption: `${pluralize('person', daySummary.spaceBookingSummaries?.length, 'people')} booked in on ${formattedDate}${generateCharacteristicsSummary(characteristicsArray, ' requiring: ')}`,
        outOfServiceBedCaption: `${pluralize('out of service bed', daySummary.outOfServiceBeds?.length)} on ${formattedDate}${generateCharacteristicsSummary(characteristicsArray, ' with: ')}`,
      }
    : {
        placementTableCaption: `People booked in on ${formattedDate}`,
        outOfServiceBedCaption: `Out of service beds on ${formattedDate}`,
      }
}

const itemListHtml = (items: Array<string>): TableCell =>
  htmlCell(`<ul class="govuk-list govuk-list--compact">
    ${items.map((item: string) => `<li>${item}</li>`).join('')}
  </ul>
`)

export type SortablePlacementColumnField = Exclude<Cas1SpaceBookingDaySummarySortField, 'releaseType'>
export type PlacementColumnField = SortablePlacementColumnField | 'spaceType'
export type OutOfServiceBedColumnField = keyof Cas1OutOfServiceBedSummary

export type ColumnDefinition<T> = {
  title: string
  fieldName: T
  sortable: boolean
}

export const placementColumnMap: Array<ColumnDefinition<PlacementColumnField>> = [
  { title: 'Name and CRN', fieldName: 'personName', sortable: true },
  { title: 'Tier', fieldName: 'tier', sortable: true },
  { title: 'Arrival date', fieldName: 'canonicalArrivalDate', sortable: true },
  { title: 'Departure date', fieldName: 'canonicalDepartureDate', sortable: true },
  { title: 'Room criteria', fieldName: 'spaceType', sortable: false },
]

export const outOfServiceBedColumnMap: Array<ColumnDefinition<OutOfServiceBedColumnField>> = [
  { title: 'Record ID', fieldName: 'id', sortable: false },
  { title: 'Reason', fieldName: 'reason', sortable: false },
  { title: 'Start date', fieldName: 'startDate', sortable: false },
  { title: 'End date', fieldName: 'endDate', sortable: false },
  { title: 'Room criteria', fieldName: 'characteristics', sortable: false },
]

export const tableHeader = <T extends string>(
  columnMap: Array<ColumnDefinition<T>>,
  sortBy?: T,
  sortDirection?: SortDirection,
  hrefPrefix?: string,
): Array<TableCell> => {
  return columnMap.map(({ title, fieldName, sortable }: ColumnDefinition<T>) =>
    sortable ? sortHeader<T>(title, fieldName, sortBy, sortDirection, hrefPrefix) : textCell(title),
  )
}

export const placementTableRows = (
  premisesId: string,
  placements: Array<Cas1SpaceBookingSummary>,
  request?: Request,
): Array<TableRow> => {
  return mapPlacementTableRows(placementColumnMap, premisesId, placements, request)
}

export const outOfServiceBedTableRows = (
  premisesId: string,
  outOfServiceBeds: Array<Cas1OutOfServiceBedSummary>,
): Array<TableRow> => {
  return outOfServiceBeds.map(({ id, bedId, startDate, endDate, characteristics, reason, roomName }) => {
    const fieldValues: Partial<Record<OutOfServiceBedColumnField, TableCell>> = {
      id: htmlCell(
        `<a href="${managePaths.outOfServiceBeds.show({
          premisesId,
          id,
          bedId,
          tab: 'details',
        })}" data-cy-id="${id}">${roomName}</a>`,
      ),
      characteristics: itemListHtml(
        characteristics.map(characteristic => getRoomCharacteristicLabel(characteristic)).filter(Boolean),
      ),
      startDate: textCell(DateFormats.isoDateToUIDate(startDate, { format: 'short' })),
      endDate: textCell(DateFormats.isoDateToUIDate(endDate, { format: 'short' })),
      reason: textCell(reason.name),
    }
    return outOfServiceBedColumnMap.map(
      ({ fieldName }: ColumnDefinition<OutOfServiceBedColumnField>) => fieldValues[fieldName],
    )
  })
}

export const generateCharacteristicsSummary = (
  characteristicsArray: Array<Cas1SpaceBookingCharacteristic>,
  prefix = ' requiring: ',
) => {
  return characteristicsArray?.length
    ? `${prefix}${joinWithCommas(
        characteristicsArray.map(characteristic => roomCharacteristicMap[characteristic].toLowerCase()),
      )}`
    : ''
}
