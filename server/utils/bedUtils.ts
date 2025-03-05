import { BedDetail, Cas1PremisesBedSummary } from '@approved-premises/api'
import { SummaryListItem, TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, sentenceCase } from './utils'
import {
  characteristicsBulletList,
  characteristicsPairToCharacteristics,
  roomCharacteristicMap,
} from './characteristicsUtils'
import { summaryListItem } from './formUtils'

export const bedNameCell = (item: Cas1PremisesBedSummary): TableCell => ({ text: item.bedName })

export const roomNameCell = (item: Cas1PremisesBedSummary): TableCell => ({ text: item.roomName })

export const actionCell = (bed: Cas1PremisesBedSummary, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const bedTableRows = (beds: Array<Cas1PremisesBedSummary>, premisesId: string) => {
  return beds.map(bed => [roomNameCell(bed), bedNameCell(bed), actionCell(bed, premisesId)])
}

export const bedDetails = (bed: BedDetail): Array<SummaryListItem> => [
  summaryListItem(
    'Characteristics',
    characteristicsBulletList(characteristicsPairToCharacteristics(bed.characteristics), {
      labels: roomCharacteristicMap,
    }),
    'html',
  ),
]

export const statusRow = (bed: BedDetail): SummaryListItem => summaryListItem('Status', sentenceCase(bed.status))

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

export const bedLink = (bed: Cas1PremisesBedSummary, premisesId: string): string =>
  linkTo(paths.premises.beds.show({ bedId: bed.id, premisesId }), {
    text: 'Manage',
    hiddenText: `bed ${bed.bedName}`,
    attributes: { 'data-cy-bedId': bed.id },
  })
