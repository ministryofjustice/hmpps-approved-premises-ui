import type { Cas1PremiseCapacity, Cas1PremiseCapacityForDay } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'

export type DateRange = {
  start: string
  end: string
}

const daysToRanges = (days: Array<Cas1PremiseCapacityForDay>) =>
  days.reduce((ranges: Array<DateRange>, capacityForDay) => {
    if (!ranges.length) {
      ranges.push({ start: capacityForDay.date, end: capacityForDay.date })
    } else {
      const lastRange = ranges[ranges.length - 1]
      if (differenceInDays(capacityForDay.date, lastRange.end) === 1) {
        lastRange.end = capacityForDay.date
      } else {
        ranges.push({ start: capacityForDay.date, end: capacityForDay.date })
      }
    }
    return ranges
  }, [])

export const renderDateRange = (dateRange: DateRange): string => {
  let render = `${DateFormats.isoDateToUIDate(dateRange.start)}`

  const totalDays =
    differenceInDays(DateFormats.isoToDateObj(dateRange.end), DateFormats.isoToDateObj(dateRange.start)) + 1
  if (totalDays > 1) {
    render += ` to ${DateFormats.isoDateToUIDate(dateRange.end)}`
  }

  const duration = DateFormats.formatDuration(daysToWeeksAndDays(totalDays)).replace(', ', ' and ')
  render += ` <strong>(${duration})</strong>`

  return render
}

export const occupancySummary = (premiseCapacity: Cas1PremiseCapacity): string => {
  const availableDays: Array<Cas1PremiseCapacityForDay> = []
  const overbookedDays: Array<Cas1PremiseCapacityForDay> = []

  premiseCapacity.capacity.forEach(capacityForDay => {
    if (capacityForDay.availableBedCount > 0) {
      availableDays.push(capacityForDay)
    } else {
      overbookedDays.push(capacityForDay)
    }
  })

  if (availableDays.length === 0) {
    return `<p class="govuk-heading-m">There are no spaces available for the dates you have selected.</p>`
  }
  if (overbookedDays.length === 0) {
    return `<p class="govuk-heading-m">The placement dates you have selected are available.</p>`
  }

  const availableRanges = daysToRanges(availableDays).map(renderDateRange)
  const overbookedRanges = daysToRanges(overbookedDays).map(renderDateRange)

  return `
    <div style="max-width: 100%">
        <h3 class="govuk-heading-m">Available on:</h3>
        <ul>
          ${availableRanges.map(range => `<li>${range}</li>`).join('')}
        </ul>
        <h3 class="govuk-heading-m">Overbooked on:</h3>
        <ul>
          ${overbookedRanges.map(range => `<li>${range}</li>`).join('')}
        </ul>
    </div>
  `
}
