import { addDays, isSameDay } from 'date-fns'
import { DateFormats } from './dateUtils'

import { BedOccupancyEntryUi, BedOccupancyRangeUi } from '../@types/ui'

export const calendar = (bedOccupancyRangeList: Array<BedOccupancyRangeUi>) => `<table cellspacing="0">
  <thead>${dateRow()}</thead>
  <tbody>${bedRows(bedOccupancyRangeList)}</tbody>
</table>`

export const dateRow = () => `
<th>Room/Bed</th>
${formatDaysForDateRow(new Date())}
`

export const formatDaysForDateRow = (date: Date) => {
  const days = generateDays(date)
  return days.map(day => `<th>${DateFormats.calendarDate(day)}</th>`).join('')
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

export const bedRows = (bedOccupancyRangeList: Array<BedOccupancyRangeUi>) => {
  return bedOccupancyRangeList.map(range => bedRow(range)).join('')
}

export const bedRow = (bedOccupancyRange: BedOccupancyRangeUi) => {
  return `<tr>
    <th scope="row">${bedOccupancyRange.bedName}</th>
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

export const cell = (cellDate: Date, bedOccupancyEntry: BedOccupancyEntryUi) => {
  if (!isSameDay(bedOccupancyEntry.startDate, cellDate)) return ''

  let cellContent: string

  switch (bedOccupancyEntry.type) {
    case 'booking':
      cellContent = occupierName(bedOccupancyEntry)
      break
    case 'open':
      cellContent = 'open'
      break
    case 'lost_bed':
      cellContent = 'lost'
      break
    default:
      cellContent = ''
  }

  return wrapCellContentInTableCellMarkup(bedOccupancyEntry.length, cellContent)
}

export const wrapCellContentInTableCellMarkup = (lengthOfOccupancy: number, cellText: string) =>
  `<td colspan="${lengthOfOccupancy}">${cellText}</td>`
