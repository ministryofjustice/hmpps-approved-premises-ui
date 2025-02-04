import type { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import { DateRange } from '@approved-premises/ui'
import { dayAvailabilityCount } from './occupancy'

const daysToRanges = (days: Array<Cas1PremiseCapacityForDay>): Array<DateRange> =>
  days.reduce((ranges: Array<DateRange>, { date }) => {
    const newRange = { from: date, duration: 1 }

    if (!ranges.length) {
      ranges.push(newRange)
    } else {
      const lastRange = ranges[ranges.length - 1]
      const previousDate = lastRange.to || lastRange.from

      if (differenceInDays(date, previousDate) < 2) {
        lastRange.to = date
        lastRange.duration += 1
      } else {
        ranges.push(newRange)
      }
    }
    return ranges
  }, [])

export type OccupancySummary = {
  available?: Array<DateRange>
  overbooked?: Array<DateRange>
}

export const occupancySummary = (
  capacity: Array<Cas1PremiseCapacityForDay>,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
): OccupancySummary => {
  const availableDays: Array<Cas1PremiseCapacityForDay> = []
  const overbookedDays: Array<Cas1PremiseCapacityForDay> = []

  capacity.forEach(capacityForDay => {
    if (dayAvailabilityCount(capacityForDay, criteria) > 0) {
      availableDays.push(capacityForDay)
    } else {
      overbookedDays.push(capacityForDay)
    }
  })

  return {
    available: availableDays.length ? daysToRanges(availableDays) : undefined,
    overbooked: overbookedDays.length ? daysToRanges(overbookedDays) : undefined,
  }
}
