import { BedOccupancyEntryUi } from '@approved-premises/ui'
import { addDays, differenceInDays, isBefore, subDays } from 'date-fns'

export const addOverbookingsToSchedule = (schedule: Array<BedOccupancyEntryUi>): Array<BedOccupancyEntryUi> => {
  const overbookings: Array<BedOccupancyEntryUi> = []

  // Ensure the schedule is ordered by date
  const orderedSchedule = schedule.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // Loop through each schedule item and check for overbookings
  const newSchedule = orderedSchedule.map((item, index) => {
    const nextItem = orderedSchedule[index + 1]
    // Is the next item a lost bed or booking?
    if (nextItem && ['booking', 'lost_bed'].includes(nextItem.type)) {
      // If it is, is the start date before our end date?
      if (isBefore(nextItem.startDate, item.endDate)) {
        // If it is, we have an overbooking
        const overlapStartDate = nextItem.startDate
        const overlapEndDate = item.endDate
        // Add the items that caused the overlap to an array
        const items = [{ ...orderedSchedule[index] }, { ...orderedSchedule[index + 1] }]
        // Change our end date to the day before overbooking's start date
        item.endDate = subDays(overlapStartDate, 1)
        item.length = differenceInDays(item.endDate, item.startDate) + 1
        // Change the next booking's start date to the day after the overbooking's end date
        nextItem.startDate = addDays(overlapEndDate, 1)
        nextItem.length = differenceInDays(nextItem.endDate, nextItem.startDate) + 1
        // We then create an overbooking with the start and end dates of each booking
        overbookings.push({
          startDate: overlapStartDate,
          endDate: overlapEndDate,
          type: 'overbooking',
          length: differenceInDays(overlapEndDate, overlapStartDate) + 1,
          items,
        })
      }
    }

    return item
  })

  // Combine the overbookings with the new schedule and sort by date
  return [...newSchedule, ...overbookings].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}
