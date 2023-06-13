import type { BedOccupancyRange, DateCapacity } from '@approved-premises/api'
import { DateFormats } from './dateUtils'
import { BedOccupancyRangeUi } from '../@types/ui'

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

export async function mapApiOccupancyToUiOccupancy(bedOccupancyRangeList: Array<BedOccupancyRange>) {
  const mappedOccupancyList = await Promise.all(
    bedOccupancyRangeList.map(async occupancyRange => {
      const mappedEntry = await mapApiOccupancyEntryToUiOccupancyEntry(occupancyRange)
      return mappedEntry
    }),
  )

  return mappedOccupancyList
}

export async function mapApiOccupancyEntryToUiOccupancyEntry(
  bedOccupancyRangeList: BedOccupancyRange,
): Promise<BedOccupancyRangeUi> {
  return {
    ...bedOccupancyRangeList,
    schedule: bedOccupancyRangeList.schedule.map(scheduleEntry => {
      return {
        ...scheduleEntry,
        startDate: DateFormats.isoToDateObj(scheduleEntry.startDate),
        endDate: DateFormats.isoToDateObj(scheduleEntry.endDate),
      }
    }),
  } as BedOccupancyRangeUi
}
