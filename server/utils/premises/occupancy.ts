import { Cas1PremiseCapacityForDay, Cas1PremisesDaySummary } from '@approved-premises/api'
import { SelectOption } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { occupancyCriteriaMap } from '../match/occupancy'
import managePaths from '../../paths/manage'
import { summaryListItem } from '../formUtils'

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
