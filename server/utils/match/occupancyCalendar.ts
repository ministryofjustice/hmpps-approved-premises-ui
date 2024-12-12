import type { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import type { OccupancyFilterCriteria } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { dayAvailabilityCount, dayHasAvailability } from './occupancy'

type CalendarDayStatus = 'available' | 'availableForCriteria' | 'overbooked'

type CalendarDay = {
  name: string
  status: CalendarDayStatus
  bookableCount: number
  criteriaBookableCount?: number
}
type CalendarMonth = {
  name: string
  days: Array<CalendarDay>
}
type Calendar = Array<CalendarMonth>

export const occupancyCalendar = (
  capacity: Array<Cas1PremiseCapacityForDay>,
  criteria: Array<OccupancyFilterCriteria> = [],
): Calendar => {
  return capacity.reduce<Calendar>((calendar, day) => {
    const dayMonthAndYear = DateFormats.isoDateToMonthAndYear(day.date)
    let currentMonth = calendar.find(month => month.name === dayMonthAndYear)

    if (!currentMonth) {
      currentMonth = {
        name: dayMonthAndYear,
        days: [],
      }
      calendar.push(currentMonth)
    }

    const calendarDay: CalendarDay = {
      name: DateFormats.isoDateToUIDate(day.date, { format: 'longNoYear' }),
      status: dayHasAvailability(day) ? 'available' : 'overbooked',
      bookableCount: dayAvailabilityCount(day),
    }

    if (criteria.length) {
      calendarDay.criteriaBookableCount = dayAvailabilityCount(day, criteria)
      if (dayHasAvailability(day, criteria) && calendarDay.status === 'overbooked') {
        calendarDay.status = 'availableForCriteria'
      }
    }

    currentMonth.days.push(calendarDay)

    return calendar
  }, [])
}
