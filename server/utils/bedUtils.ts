import { BedDetail, BedSummary } from '../@types/shared'
import { BedOccupancyOverbookingEntryUi, SummaryListItem, TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, sentenceCase } from './utils'

export class InvalidOverbookingDataException extends Error {}

export const bedTableRows = (beds: Array<BedSummary>, premisesId: string) => {
  return beds.map(bed => [roomNameCell(bed), bedNameCell(bed), statusCell(bed), actionCell(bed, premisesId)])
}

export const bedNameCell = (item: { name: string }): TableCell => ({ text: item.name })

export const roomNameCell = (item: { roomName: string }): TableCell => ({ text: item.roomName })

export const statusCell = (bed: BedSummary): TableCell => ({ text: sentenceCase(bed.status) })

export const actionCell = (bed: BedSummary, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const bedDetails = (bed: BedDetail): Array<SummaryListItem> => {
  return [statusRow(bed), characteristicsRow(bed)]
}

export const statusRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Status' },
  value: { text: sentenceCase(bed.status) },
})

export const characteristicsRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Characteristics' },
  value: {
    html: `<ul class="govuk-list govuk-list--bullet">
  ${bed.characteristics.map(characteristic => `<li>${sentenceCase(characteristic.propertyName)}</li>`).join(' ')}</ul>`,
  },
})

export const title = (bed: BedDetail, pageTitle: string): string => {
  return `
  <h1 class="govuk-heading-l">
    <span class="govuk-caption-l">${bed.name}</span>
    ${pageTitle}
  </h1>
  `
}

export const bedActions = (bed: BedDetail, premisesId: string) => {
  return {
    items: [
      {
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId, bedId: bed.id }),
      },
      {
        text: 'Mark this bed as out of service',
        classes: 'govuk-button--secondary',
        href: paths.lostBeds.new({ premisesId, bedId: bed.id }),
      },
    ],
  }
}

const bedLink = (bed: BedSummary, premisesId: string): string =>
  linkTo(
    paths.premises.beds.show,
    { bedId: bed.id, premisesId },
    {
      text: 'Manage',
      hiddenText: `bed ${bed.name}`,
      attributes: { 'data-cy-bedId': bed.id },
    },
  )

export const encodeOverbooking = (overbooking: BedOccupancyOverbookingEntryUi): string => {
  const json = JSON.stringify(overbooking)

  return Buffer.from(json).toString('base64')
}

export const decodeOverbooking = (string: string): BedOccupancyOverbookingEntryUi => {
  const json = Buffer.from(string, 'base64').toString('utf-8')
  const obj = JSON.parse(json, (name, value) => {
    if (['startDate', 'endDate'].includes(name)) {
      return new Date(value)
    }
    return value
  })

  if ('startDate' in obj && 'endDate' in obj && 'length' in obj && 'type' in obj && 'items' in obj) {
    return obj as BedOccupancyOverbookingEntryUi
  }

  throw new InvalidOverbookingDataException()
}
