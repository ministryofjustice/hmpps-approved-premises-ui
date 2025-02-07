import {
  Cas1OutOfServiceBedSummary,
  Cas1PremiseCapacityForDay,
  Cas1PremisesDaySummary,
  Cas1SpaceBookingDaySummary,
  Cas1SpaceBookingDaySummarySortField,
  SortDirection,
} from '@approved-premises/api'
import { SelectOption, TableCell, TableRow } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { getTierOrBlank, htmlValue, textValue } from '../applications/helpers'
import { occupancyCriteriaMap } from '../match/occupancy'
import managePaths from '../../paths/manage'
import { summaryListItem } from '../formUtils'
import { sortHeader } from '../sortHeader'
import { laoSummaryName } from '../personUtils'
import { spaceSearchCriteriaRoomLevelLabels } from '../match/spaceSearch'

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

export const occupancyCalendar = (capacity: Array<Cas1PremiseCapacityForDay>, premisesId: string): Calendar => {
  return capacity.reduce<Calendar>((calendar, { availableBedCount, bookingCount, date }) => {
    const monthAndYear = DateFormats.isoDateToMonthAndYear(date)
    let currentMonth = calendar.find(month => month.name === monthAndYear)

    if (!currentMonth) {
      currentMonth = {
        name: monthAndYear,
        days: [],
      }
      calendar.push(currentMonth)
    }

    const availability = availableBedCount - bookingCount
    const statusMap: Record<string, CalendarDayStatus> = { '-1': 'overbooked', '0': 'full', '1': 'available' }
    const status: CalendarDayStatus = statusMap[String(Math.sign(availability))]

    const calendarDay: CalendarDay = {
      name: DateFormats.isoDateToUIDate(date, { format: 'longNoYear' }),
      status,
      availability,
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

export const generateDaySummaryText = (daySummary: Cas1PremisesDaySummary): string => {
  const {
    capacity: { characteristicAvailability, availableBedCount, bookingCount },
  } = daySummary
  const overbookedCriteria = characteristicAvailability
    .map(({ characteristic, availableBedsCount, bookingsCount }) =>
      bookingsCount > availableBedsCount ? characteristic : undefined,
    )
    .filter(Boolean)
  const messages: Array<string> = []
  if (bookingCount > availableBedCount) messages.push('has bookings exceeding its available capacity')
  if (overbookedCriteria.length)
    messages.push(
      `is overbooked on spaces with the following ${overbookedCriteria.length > 1 ? 'criteria' : 'criterion'}: ${overbookedCriteria.map(characteristic => occupancyCriteriaMap[characteristic].toLowerCase()).join(', ')}`,
    )
  return messages.length ? `This AP ${messages.join(' and ')}.` : ''
}

export const daySummaryRows = (daySummary: Cas1PremisesDaySummary) => {
  const {
    capacity: { totalBedCount, bookingCount, availableBedCount },
  } = daySummary

  return {
    rows: [
      summaryListItem('Capacity', String(totalBedCount)),
      summaryListItem('Booked spaces', String(bookingCount)),
      summaryListItem('Out of service beds', String(totalBedCount - availableBedCount)),
      summaryListItem('Available spaces', String(availableBedCount - bookingCount)),
    ],
  }
}

const itemListHtml = (items: Array<string>): { html: string } =>
  htmlValue(`<ul class="govuk-list govuk-list">
    ${items.map((item: string) => `<li>${item}</li>`).join('')}
  </ul>
`)

export type PlacementColumnField = Cas1SpaceBookingDaySummarySortField | 'spaceType'
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
  { title: 'Release type', fieldName: 'releaseType', sortable: true },
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
    sortable ? sortHeader<T>(title, fieldName, sortBy, sortDirection, hrefPrefix) : textValue(title),
  )
}

export const placementTableRows = (
  premisesId: string,
  placements: Array<Cas1SpaceBookingDaySummary>,
): Array<TableRow> =>
  placements.map(
    ({ id, person, tier, canonicalArrivalDate, canonicalDepartureDate, releaseType, essentialCharacteristics }) => {
      const fieldValues: Record<PlacementColumnField, TableCell> = {
        personName: htmlValue(
          `<a href="${managePaths.premises.placements.show({
            premisesId,
            placementId: id,
          })}" data-cy-id="${id}">${laoSummaryName(person)}, ${person.crn}</a>`,
        ),
        tier: htmlValue(getTierOrBlank(tier)),
        canonicalArrivalDate: textValue(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' })),
        canonicalDepartureDate: textValue(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' })),
        releaseType: textValue(releaseType),
        spaceType: itemListHtml(
          essentialCharacteristics
            .map(characteristic => spaceSearchCriteriaRoomLevelLabels[characteristic])
            .filter(Boolean),
        ),
      }
      return placementColumnMap.map(({ fieldName }: ColumnDefinition<PlacementColumnField>) => fieldValues[fieldName])
    },
  )

export const outOfServiceBedTableRows = (
  premisesId: string,
  outOfServiceBeds: Array<Cas1OutOfServiceBedSummary>,
): Array<TableRow> => {
  return outOfServiceBeds.map(({ id, bedId, startDate, endDate, characteristics, reason, roomName }) => {
    const fieldValues: Partial<Record<OutOfServiceBedColumnField, TableCell>> = {
      id: htmlValue(
        `<a href="${managePaths.outOfServiceBeds.show({
          premisesId,
          id,
          bedId,
          tab: 'details',
        })}" data-cy-id="${id}">${roomName}</a>`,
      ),
      characteristics: itemListHtml(
        characteristics.map(characteristic => spaceSearchCriteriaRoomLevelLabels[characteristic]).filter(Boolean),
      ),
      startDate: textValue(DateFormats.isoDateToUIDate(startDate, { format: 'short' })),
      endDate: textValue(DateFormats.isoDateToUIDate(endDate, { format: 'short' })),
      reason: textValue(reason.name),
    }
    return outOfServiceBedColumnMap.map(
      ({ fieldName }: ColumnDefinition<OutOfServiceBedColumnField>) => fieldValues[fieldName],
    )
  })
}
