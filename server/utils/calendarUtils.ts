import { addDays } from 'date-fns'
import { DateFormats } from './dateUtils'

export const calendar = () => `<table cellspacing="0">
  <thead>${dateRow()}</thead>
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
