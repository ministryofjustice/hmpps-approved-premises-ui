import type { DateCapacity } from '@approved-premises/api'

export type NegativeDateRange = { start?: string; end?: string }

export default function getDateRangesWithNegativeBeds(premisesCapacity: Array<DateCapacity>): Array<NegativeDateRange> {
  let dateRange: NegativeDateRange = {}
  const result: Array<NegativeDateRange> = []

  premisesCapacity.forEach((premisesCapacityItem, i, arr) => {
    if (premisesCapacityItem.availableBeds < 0 && !dateRange?.start) {
      dateRange.start = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds < 0 && dateRange.start) {
      dateRange.end = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds >= 0 && dateRange.start) {
      result.push(dateRange)
      dateRange = {}
    }
    if (arr.length === i + 1 && dateRange.start) {
      result.push(dateRange)
    }
  })

  return result
}
