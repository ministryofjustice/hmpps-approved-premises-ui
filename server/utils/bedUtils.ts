import { Cas1BedDetail, Cas1PremisesBedSummary } from '@approved-premises/api'
import { SummaryList, TableCell, UserDetails } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo } from './utils'
import { characteristicsBulletList, roomCharacteristicMap } from './characteristicsUtils'
import { summaryListItem } from './formUtils'
import { hasPermission } from './users'

export const bedsActions = (premisesId: string, user: UserDetails) =>
  hasPermission(user, ['cas1_out_of_service_bed_create'])
    ? [
        {
          items: [
            {
              text: 'Manage out of service beds',
              classes: 'govuk-button--secondary',
              href: paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }),
            },
          ],
        },
      ]
    : null

export const bedNameCell = (item: Cas1PremisesBedSummary): TableCell => ({ text: item.bedName })

export const roomNameCell = (item: Cas1PremisesBedSummary): TableCell => ({ text: item.roomName })

export const actionCell = (bed: Cas1PremisesBedSummary, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const bedsTableRows = (beds: Array<Cas1PremisesBedSummary>, premisesId: string) => {
  return beds.map(bed => [roomNameCell(bed), bedNameCell(bed), actionCell(bed, premisesId)])
}

export const bedDetails = (bed: Cas1BedDetail): SummaryList => ({
  rows: [
    summaryListItem(
      'Characteristics',
      characteristicsBulletList(bed.characteristics, { labels: roomCharacteristicMap }),
      'html',
    ),
  ],
})

export const bedActions = (bed: Cas1BedDetail, premisesId: string, user: UserDetails) => {
  return hasPermission(user, ['cas1_out_of_service_bed_create'])
    ? [
        {
          items: [
            {
              text: 'Create out of service bed record',
              classes: 'govuk-button--secondary',
              href: paths.outOfServiceBeds.new({ premisesId, bedId: bed.id }),
            },
          ],
        },
      ]
    : null
}

export const bedLink = (bed: Cas1PremisesBedSummary, premisesId: string): string =>
  linkTo(paths.premises.beds.show({ bedId: bed.id, premisesId }), {
    text: 'Manage',
    hiddenText: `bed ${bed.bedName}`,
    attributes: { 'data-cy-bedId': bed.id },
  })
