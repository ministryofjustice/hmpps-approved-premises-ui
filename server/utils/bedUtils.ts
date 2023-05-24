import { BedDetail, BedSummary } from '../@types/shared'
import { SummaryListItem, TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, sentenceCase } from './utils'

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
