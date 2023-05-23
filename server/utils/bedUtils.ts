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
