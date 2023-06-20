import { addDays, format, formatDistanceStrict, isSameDay, isSameMonth } from 'date-fns'
import { DateFormats } from './dateUtils'

import { BedOccupancyEntryUi, BedOccupancyEntryUiType, BedOccupancyRangeUi } from '../@types/ui'

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
) => `<table class="${calendarTableClass}" cellspacing="0">
  <thead class="${headClass}">${dateRow()}</thead>
  <tr class="${rowClass}">${monthRow(startDate)}</tr>
  <tbody class="${bodyClass}">${bedRows(bedOccupancyRangeList)}</tbody>
</table>`

export const dateRow = () => `
<th class="${roomHeaderClass}">Room/Bed</th>
${formatDaysForDateRow(new Date())}
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
  const monthRowArr = [`<td class="${cellClass}"></td>`]
  const days = generateDays(startDate)

  for (let i = 0; i < days.length; i += 1) {
    if (!isSameMonth(days[i], days[i - 1]) || i === 0) {
      const month = format(days[i], 'MMMM')

      const colspan = days.slice(i).filter(d => isSameMonth(d, days[i])).length

      monthRowArr.push(`<th colspan="${colspan}" class="${cellClass} ${tableClass}__cell--month">${month}</th>`)
    }
  }

  return monthRowArr.join('')
}

export const bedRows = (bedOccupancyRangeList: Array<BedOccupancyRangeUi>) => {
  return bedOccupancyRangeList.map(range => bedRow(range)).join('')
}

export const bedRow = (bedOccupancyRange: BedOccupancyRangeUi) => {
  return `<tr class="${rowClass}">
    <th scope="row" class="${headerClass}">${bedOccupancyRange.bedName}</th>
    ${generateRowCells(bedOccupancyRange)}</tr>`
}

export const generateRowCells = (bedOccupancyRange: BedOccupancyRangeUi) => {
  return generateDays(new Date())
    .map(day => bedOccupancyRange.schedule.map(entry => cell(day, entry)).join(''))
    .join('')
}

export const occupierName = (bedOccupancyEntry: BedOccupancyEntryUi) => {
  if (bedOccupancyEntry.type === 'booking') return bedOccupancyEntry.personName
  return ''
}

export const bookingCellContent = (bedOccupancyEntry: BedOccupancyEntryUi) => {
  const name = occupierName(bedOccupancyEntry)
  const lengthOfStay = bedOccupancyEntry.length
  const lengthOfStayInWords = formatDistanceStrict(bedOccupancyEntry.startDate, bedOccupancyEntry.endDate)
  const startAndEndDates = `${DateFormats.dateObjtoUIDate(bedOccupancyEntry.startDate, {
    format: 'short',
  })} - ${DateFormats.dateObjtoUIDate(bedOccupancyEntry.endDate, { format: 'short' })}`

  if (lengthOfStay < 5) return name

  if (lengthOfStay >= 5 && lengthOfStay < 10) return `${name} (${lengthOfStayInWords})`

  if (lengthOfStay >= 10) return `${name} (${lengthOfStayInWords} ${startAndEndDates})`

  return ''
}

export const cell = (cellDate: Date, bedOccupancyEntry: BedOccupancyEntryUi) => {
  if (!isSameDay(bedOccupancyEntry.startDate, cellDate)) return ''

  let cellContent: string

  switch (bedOccupancyEntry.type) {
    case 'booking':
      cellContent = bookingCellContent(bedOccupancyEntry)
      break
    case 'open':
      cellContent = '<span class="govuk-visually-hidden">open</span>'
      break
    case 'lost_bed':
      cellContent = 'lost'
      break
    default:
      cellContent = ''
  }

  return wrapCellContentInTableCellMarkup(bedOccupancyEntry.length, cellContent, bedOccupancyEntry.type)
}

export const wrapCellContentInTableCellMarkup = (
  lengthOfOccupancy: number,
  cellText: string,
  type: BedOccupancyEntryUiType,
) => `<td class="${cellClass} ${tableClass}__cell--${type}" colspan="${lengthOfOccupancy}">${cellText}</td>`
