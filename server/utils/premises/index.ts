import type {
  ApprovedPremisesSummary,
  BedOccupancyRange,
  Cas1PremisesSummary,
  DateCapacity,
  ApprovedPremisesSummary as PremisesSummary,
} from '@approved-premises/api'
import { BedOccupancyRangeUi, SelectGroup, SummaryList } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { addOverbookingsToSchedule } from '../addOverbookingsToSchedule'
import { htmlValue, textValue } from '../applications/helpers'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import { linkTo } from '../utils'

export { premisesActions }

export type NegativeDateRange = { start?: string; end?: string }

export const overcapacityMessage = (premisesCapacity: Array<DateCapacity> = []): string => {
  let dateRange: NegativeDateRange = {}
  const overcapacityDateRanges: Array<NegativeDateRange> = []
  let message: string

  premisesCapacity.forEach((premisesCapacityItem, i, arr) => {
    if (premisesCapacityItem.availableBeds < 0 && !dateRange?.start) {
      dateRange.start = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds < 0 && dateRange.start) {
      dateRange.end = premisesCapacityItem.date
    } else if (premisesCapacityItem.availableBeds >= 0 && dateRange.start) {
      overcapacityDateRanges.push(dateRange)
      dateRange = {}
    }
    if (arr.length === i + 1 && dateRange.start) {
      overcapacityDateRanges.push(dateRange)
    }
  })

  if (overcapacityDateRanges.length === 1) {
    if (!overcapacityDateRanges[0].end) {
      return `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on ${DateFormats.isoDateToUIDate(
        overcapacityDateRanges[0].start,
      )}</h3>`
    }
    message = `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period ${DateFormats.isoDateToUIDate(
      overcapacityDateRanges[0].start,
    )} to ${DateFormats.isoDateToUIDate(overcapacityDateRanges[0].end)}</h3>`
  }

  if (overcapacityDateRanges.length > 1) {
    const dateRanges = overcapacityDateRanges
      .map((range: NegativeDateRange) =>
        !range.end
          ? `<li>${DateFormats.isoDateToUIDate(range.start)}</li>`
          : `<li>${DateFormats.isoDateToUIDate(range.start)} to ${DateFormats.isoDateToUIDate(range.end)}</li>`,
      )
      .join('')
    message = `<h3 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h3>
      <ul class="govuk-list govuk-list--bullet">${dateRanges}</ul>`
  }

  return message
}

export const mapApiOccupancyToUiOccupancy = async (bedOccupancyRangeList: Array<BedOccupancyRange>) => {
  const mappedOccupancyList = await Promise.all(
    bedOccupancyRangeList.map(async occupancyRange => {
      const mappedEntry = await mapApiOccupancyEntryToUiOccupancyEntry(occupancyRange)
      return mappedEntry
    }),
  )

  const occupancyListWithOverBookings = mappedOccupancyList.map(item => ({
    ...item,
    schedule: addOverbookingsToSchedule(item.schedule),
  }))

  return occupancyListWithOverBookings
}

export const mapApiOccupancyEntryToUiOccupancyEntry = async (
  bedOccupancyRangeList: BedOccupancyRange,
): Promise<BedOccupancyRangeUi> => {
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

export const summaryListForPremises = (premises: Cas1PremisesSummary): SummaryList => {
  return {
    rows: [
      {
        key: textValue('Code'),
        value: textValue(premises.apCode),
      },
      {
        key: textValue('Postcode'),
        value: textValue(premises.postcode),
      },
      {
        key: textValue('Number of Beds'),
        value: textValue(premises.bedCount.toString()),
      },
      {
        key: textValue('Available Beds'),
        value: textValue(premises.availableBeds.toString()),
      },
    ],
  }
}

export const groupedSelectOptions = (
  premises: Array<ApprovedPremisesSummary>,
  context: Record<string, unknown>,
  fieldName: string = 'premisesId',
): Array<SelectGroup> => {
  const apAreas = [...new Set(premises.map(item => item.apArea))]
  return apAreas.map(apArea => ({
    label: apArea,
    items: premises
      .filter(item => item.apArea === apArea)
      .map(item => ({
        text: item.name,
        value: item.id,
        selected: context[fieldName] === item.id,
      })),
  }))
}

export const groupCas1SummaryPremisesSelectOptions = (
  premises: Array<Cas1PremisesSummary>,
  context: Record<string, unknown>,
  fieldName: string = 'premisesId',
): Array<SelectGroup> => {
  const apAreas = premises.reduce((map, { apArea }) => {
    map[apArea.id] = apArea
    return map
  }, {})
  return Object.values(apAreas).map(({ id, name }) => ({
    label: name,
    items: premises
      .filter(item => item.apArea.id === id)
      .map(item => ({
        text: item.name,
        value: item.id,
        selected: context[fieldName] === item.id,
      })),
  }))
}

export const premisesTableRows = (premisesSummaries: Array<PremisesSummary>) => {
  return premisesSummaries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p: ApprovedPremisesSummary) => {
      return [
        textValue(p.name),
        textValue(p.apCode),
        textValue(p.bedCount.toString()),
        htmlValue(linkTo(paths.premises.show, { premisesId: p.id }, { text: 'View', hiddenText: `about ${p.name}` })),
      ]
    })
}
