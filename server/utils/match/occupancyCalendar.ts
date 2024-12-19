import type { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { DateFormats } from '../dateUtils'
import { dayAvailabilityCount, dayAvailabilityStatus } from './occupancy'

type CalendarDayStatus = 'available' | 'availableForCriteria' | 'overbooked'

type CalendarDay = {
  date: string
  name: string
  status: CalendarDayStatus
  bookableCount: number
  criteriaBookableCount?: number
}
type CalendarMonth = {
  name: string
  days: Array<CalendarDay>
}
export type Calendar = Array<CalendarMonth>

export const occupancyCalendar = (
  capacity: Array<Cas1PremiseCapacityForDay>,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
): Calendar => {
  return capacity.reduce<Calendar>((calendar, day) => {
    const monthAndYear = DateFormats.isoDateToMonthAndYear(day.date)
    let currentMonth = calendar.find(month => month.name === monthAndYear)

    if (!currentMonth) {
      currentMonth = {
        name: monthAndYear,
        days: [],
      }
      calendar.push(currentMonth)
    }

    const bookableCount = dayAvailabilityCount(day)

    const calendarDay: CalendarDay = {
      date: day.date,
      name: DateFormats.isoDateToUIDate(day.date, { format: 'longNoYear' }),
      status: dayAvailabilityStatus(day, criteria),
      bookableCount,
    }

    if (criteria.length) {
      calendarDay.criteriaBookableCount = dayAvailabilityCount(day, criteria)
    }

    currentMonth.days.push(calendarDay)

    return calendar
  }, [])
}
