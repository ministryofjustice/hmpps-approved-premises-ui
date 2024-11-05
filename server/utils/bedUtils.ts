import { BedDetail, BedSummary } from '@approved-premises/api'
import { SummaryListItem, TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, sentenceCase } from './utils'
import { translateCharacteristic } from './characteristicsUtils'

export const bedNameCell = (item: { name: string }): TableCell => ({ text: item.name })

export const roomNameCell = (item: { roomName: string }): TableCell => ({ text: item.roomName })

export const statusCell = (bed: BedSummary): TableCell => ({ text: sentenceCase(bed.status) })

export const actionCell = (bed: BedSummary, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const bedTableRows = (beds: Array<BedSummary>, premisesId: string) => {
  return beds.map(bed => [roomNameCell(bed), bedNameCell(bed), actionCell(bed, premisesId)])
}

export const bedDetails = (bed: BedDetail): Array<SummaryListItem> => {
  return [characteristicsRow(bed)]
}

export const statusRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Status' },
  value: { text: sentenceCase(bed.status) },
})

export const characteristicsRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Characteristics' },
  value: {
    html: `<ul class="govuk-list govuk-list--bullet">
  ${bed.characteristics.map(characteristic => `<li>${translateCharacteristic(characteristic)}</li>`).join(' ')}</ul>`,
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
        text: 'Create out of service bed record',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.new({ premisesId, bedId: bed.id }),
      },
    ],
  }
}

export const bedLink = (bed: BedSummary, premisesId: string): string => {
  return linkTo(
    paths.premises.beds.show,
    { bedId: bed.id, premisesId },
    {
      text: 'Manage',
      hiddenText: `bed ${bed.name}`,
      attributes: { 'data-cy-bedId': bed.id },
    },
  )
}
