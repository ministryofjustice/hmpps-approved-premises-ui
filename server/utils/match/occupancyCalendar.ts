import { Cas1PremiseCapacity } from '@approved-premises/api'
import { DateFormats } from '../dateUtils'
import { dayAvailabilityCount } from './occupancy'

type CalendarDay = {
  name: string
  bookableCount: number
}
type CalendarMonth = {
  name: string
  days: Array<CalendarDay>
}
type Calendar = Array<CalendarMonth>

export const occupancyCalendar = (capacity: Cas1PremiseCapacity) => {
  const calendar: Calendar = []

  capacity.capacity.forEach(day => {
    const dayMonthAndYear = DateFormats.isoDateToMonthAndYear(day.date)
    let currentMonth = calendar.find(month => month.name === dayMonthAndYear)

    if (!currentMonth) {
      currentMonth = {
        name: dayMonthAndYear,
        days: [],
      }
      calendar.push(currentMonth)
    }

    currentMonth.days.push({
      name: DateFormats.isoDateToUIDate(day.date, { format: 'longNoYear' }),
      bookableCount: dayAvailabilityCount(day),
    })
  })

  return calendar
}
