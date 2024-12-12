import type { Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import { OccupancyFilterCriteria } from '@approved-premises/ui'
import { dayHasAvailability } from './occupancy'

type DateRange = {
  from: string
  to?: string
  duration: number
}

const daysToRanges = (days: Array<Cas1PremiseCapacityForDay>): Array<DateRange> =>
  days
    .reduce((ranges: Array<Omit<DateRange, 'duration'>>, capacityForDay) => {
      if (!ranges.length) {
        ranges.push({ from: capacityForDay.date })
      } else {
        const lastRange = ranges[ranges.length - 1]
        const previousDate = lastRange.to || lastRange.from

        if (differenceInDays(capacityForDay.date, previousDate) === 1) {
          lastRange.to = capacityForDay.date
        } else {
          ranges.push({ from: capacityForDay.date })
        }
      }
      return ranges
    }, [])
    .map(range => ({
      ...range,
      duration: range.to ? differenceInDays(range.to, range.from) + 1 : 1,
    }))

type OccupancySummary = {
  available?: Array<DateRange>
  overbooked?: Array<DateRange>
}

export const occupancySummary = (
  capacity: Array<Cas1PremiseCapacityForDay>,
  criteria: Array<OccupancyFilterCriteria> = [],
): OccupancySummary => {
  const availableDays: Array<Cas1PremiseCapacityForDay> = []
  const overbookedDays: Array<Cas1PremiseCapacityForDay> = []

  capacity.forEach(capacityForDay => {
    if (dayHasAvailability(capacityForDay, criteria)) {
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
