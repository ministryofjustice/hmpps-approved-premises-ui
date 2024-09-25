import {
  addDays,
  differenceInDays,
  format,
  formatDistanceStrict,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import paths from '../paths/manage'
import { DateFormats } from './dateUtils'

import { BedOccupancyEntryCalendar, BedOccupancyEntryUi, BedOccupancyRangeUi } from '../@types/ui'
import { encodeOverbooking } from './bedUtils'
import { createQueryString } from './utils'

export const tableClass = 'govuk-table'
export const calendarTableClass = `${tableClass} ${tableClass}--calendar`
export const headClass = `${tableClass}__head ${tableClass}__head--calendar`
export const bodyClass = `${tableClass}__body ${tableClass}__body--calendar`
export const headerClass = `${tableClass}__header ${tableClass}__header--calendar`
export const roomHeaderClass = `${headerClass} ${tableClass}__header--calendar-room-header`
export const rowClass = `${tableClass}__row ${tableClass}__row--calendar`
export const cellClass = `${tableClass}__cell ${tableClass}__cell--calendar`

export const calendar = (
  bedOccupancyRangeList: Array<BedOccupancyRangeUi>,
  startDate: Date,
  premisesId: string,
) => `<table class="${calendarTableClass}" cellspacing="0">
  <thead class="${headClass}">
    <tr class="${rowClass} ${tableClass}__row--months">${monthRow(startDate)}</tr>
    ${dateRow(startDate)}
  </thead>
  <tbody class="${bodyClass}">${bedRows(bedOccupancyRangeList, startDate, premisesId)}</tbody>
</table>`

export const dateRow = (startDate: Date) => `
<tr class="${rowClass}">
  ${formatDaysForDateRow(startDate)}
</tr>
`

export const formatDaysForDateRow = (date: Date) => {
  const days = generateDays(date)
  return days.map(day => `<th class="${headerClass}">${DateFormats.calendarDate(day)}</th>`).join('')
}

export const generateDays = (date: Date) => {
  date.setHours(0, 0, 0, 0)
  const days = []
  for (let i = 0; i < 30; i += 1) {
    const newDate = addDays(date, i)
    days.push(newDate)
  }
  return days
}

export const monthRow = (startDate: Date) => {
  const monthRowArr = [`<th class="${roomHeaderClass}" rowspan="2">Room/Bed</th>`]
  const days = generateDays(startDate)

  for (let i = 0; i < days.length; i += 1) {
    if (!isSameMonth(days[i], days[i - 1]) || i === 0) {
      const month = format(days[i], 'MMMM')

      const colspan = days.slice(i).filter(d => isSameMonth(d, days[i])).length

      monthRowArr.push(`<th colspan="${colspan}" class="${headerClass} ${tableClass}__head--month">${month}</th>`)
    }
  }

  return monthRowArr.join('')
}

export const bedRows = (bedOccupancyRangeList: Array<BedOccupancyRangeUi>, startDate: Date, premisesId: string) => {
  return bedOccupancyRangeList.map(range => bedRow(range, startDate, premisesId)).join('')
}

export const bedRow = (bedOccupancyRange: BedOccupancyRangeUi, startDate: Date, premisesId: string) => {
  return `<tr class="${rowClass}" data-cy-bedId="${bedOccupancyRange.bedId}">
    <th scope="row" class="${headerClass}"><a href="${paths.v2Manage.premises.beds.show({
      premisesId,
      bedId: bedOccupancyRange.bedId,
    })}" class="govuk-link">${bedOccupancyRange.bedName}</a></th>
    ${generateRowCells(bedOccupancyRange, startDate, premisesId)}</tr>`
}

export const labelForScheduleItem = (
  bedOccupancyEntry: BedOccupancyEntryUi,
  premisesId: string,
  bedId: string,
): string => {
  if (bedOccupancyEntry.type === 'open') {
    return '<span class="govuk-visually-hidden">open</span>'
  }

  let label: string
  let link: string

  switch (bedOccupancyEntry.type) {
    case 'booking':
      label = bedOccupancyEntry.personName
      link = paths.bookings.show({ premisesId, bookingId: bedOccupancyEntry.bookingId })
      break
    case 'lost_bed':
      label = 'Out of Service'
      link = paths.v2Manage.outOfServiceBeds.show({
        bedId,
        premisesId,
        id: bedOccupancyEntry.lostBedId,
        tab: 'details',
      })
      break
    case 'overbooking':
      label = 'Overbooked'
      link = `${paths.premises.beds.overbookings.show({ bedId, premisesId })}?${createQueryString({
        overbooking: encodeOverbooking(bedOccupancyEntry),
      })}`
      break
    default:
      throw new Error(`Unknown entry type: ${(bedOccupancyEntry as BedOccupancyEntryUi).type}`)
  }

  const entryLengthInWords = formatDistanceStrict(bedOccupancyEntry.startDate, bedOccupancyEntry.endDate)
  const startAndEndDates = `${DateFormats.dateObjtoUIDate(bedOccupancyEntry.startDate, {
    format: 'short',
  })} - ${DateFormats.dateObjtoUIDate(bedOccupancyEntry.endDate, { format: 'short' })}`

  label += ` (${entryLengthInWords} ${startAndEndDates})`

  return `
    <span title="${label}" class="tooltip">
      <a href="${link}" class="govuk-link govuk-link--${bedOccupancyEntry.type}">${label}</a>
    </span>
  `
}

export const scheduleForCalendar = (
  schedule: Array<BedOccupancyEntryUi>,
  startDate: Date,
  premisesId: string,
  bedId: string,
): Array<BedOccupancyEntryCalendar> => {
  return schedule.map(bedOccupancyEntry => {
    const endDate = addDays(startDate, 30)
    const scheduleStartDate = isBefore(bedOccupancyEntry.startDate, startDate) ? startDate : bedOccupancyEntry.startDate
    const scheduleEndDate = isAfter(bedOccupancyEntry.endDate, endDate) ? endDate : bedOccupancyEntry.endDate
    return {
      ...bedOccupancyEntry,
      label: labelForScheduleItem(bedOccupancyEntry, premisesId, bedId),
      startDate: scheduleStartDate,
      endDate: scheduleEndDate,
      length: differenceInDays(scheduleEndDate, scheduleStartDate) + 1,
    }
  })
}

export const generateRowCells = (bedOccupancyRange: BedOccupancyRangeUi, startDate: Date, premisesId: string) => {
  return generateDays(startDate)
    .map(day =>
      scheduleForCalendar(bedOccupancyRange.schedule, startDate, premisesId, bedOccupancyRange.bedId)
        .map(entry => cell(day, entry))
        .join(''),
    )
    .join('')
}

export const cell = (cellDate: Date, bedOccupancyEntry: BedOccupancyEntryCalendar) => {
  if (!isSameDay(bedOccupancyEntry.startDate, cellDate)) return ''

  return wrapCellContentInTableCellMarkup(bedOccupancyEntry)
}

export const wrapCellContentInTableCellMarkup = (bedOccupancyEntry: BedOccupancyEntryCalendar) =>
  `<td class="${cellClass} ${tableClass}__cell--${bedOccupancyEntry.type}" colspan="${
    bedOccupancyEntry.length
  }" data-cy-startdate="${DateFormats.dateObjToIsoDate(bedOccupancyEntry.startDate)}" data-cy-id="${entryId(
    bedOccupancyEntry,
  )}">${bedOccupancyEntry.label}</td>`

const entryId = (bedOccupancyEntry: BedOccupancyEntryCalendar) => {
  if ('bookingId' in bedOccupancyEntry) {
    return bedOccupancyEntry.bookingId
  }
  if ('lostBedId' in bedOccupancyEntry) {
    return bedOccupancyEntry.lostBedId
  }
  return ''
}
