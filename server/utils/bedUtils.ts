import { Cas1BedDetail, Cas1PremisesBedSummary, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { SummaryList, UserDetails } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, makeArrayOfType } from './utils'
import { characteristicsBulletList, roomCharacteristicMap } from './characteristicsUtils'
import { summaryListItem } from './formUtils'
import { hasPermission } from './users'
import { htmlCell, textCell } from './tableUtils'

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

export const bedsTableRows = (beds: Array<Cas1PremisesBedSummary>, premisesId: string) => {
  const sorted = beds.sort(({ bedName: name1 }, { bedName: name2 }) =>
    name1.localeCompare(name2, 'en', { numeric: true, sensitivity: 'base' }),
  )

  return sorted.map(bed => [
    htmlCell(
      linkTo(paths.premises.beds.show({ bedId: bed.id, premisesId }), {
        text: bed.bedName,
        hiddenPrefix: `bed name:`,
        attributes: { 'data-cy-bedId': bed.id },
      }),
    ),
    textCell(bed.roomName),
    htmlCell(characteristicsBulletList(bed.characteristics, { classes: 'govuk-list--compact' })),
  ])
}

export const bedsTableHeader = () => {
  return [textCell('Bed name'), textCell('Room name'), textCell('Room characteristics')]
}

export const characteristicsSummary = (characteristics: Array<Cas1SpaceCharacteristic>): SummaryList => ({
  rows: [
    summaryListItem(
      'Characteristics',
      characteristicsBulletList(characteristics, { labels: roomCharacteristicMap }),
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

export const calculateBedCounts = (
  beds: Array<Cas1PremisesBedSummary>,
): Partial<Record<Cas1SpaceCharacteristic, number>> =>
  beds.reduce(
    (counts, { characteristics }) => {
      characteristics.forEach(characteristic => {
        counts[characteristic] = counts[characteristic] || 0
        counts[characteristic] += 1
      })
      return counts
    },
    {} as Partial<Record<Cas1SpaceCharacteristic, number>>,
  )

export const generateCharacteristicsLabels = (
  bedCounts: Partial<Record<Cas1SpaceCharacteristic, number>>,
): Record<Cas1SpaceCharacteristic, string> =>
  Object.entries(roomCharacteristicMap).reduce(
    (out, [characteristic, label]: [Cas1SpaceCharacteristic, string]) => {
      if (bedCounts[characteristic] !== undefined) {
        out[characteristic] = `${label} (${bedCounts[characteristic]})`
      }
      return out
    },
    {} as Record<Cas1SpaceCharacteristic, string>,
  )

export const filterBedsByCharacteristics = (
  beds: Array<Cas1PremisesBedSummary>,
  filterCharacteristics: Array<Cas1SpaceCharacteristic>,
): Array<Cas1PremisesBedSummary> =>
  filterCharacteristics?.length
    ? beds.filter(bed => {
        return makeArrayOfType<Cas1SpaceCharacteristic>(filterCharacteristics).every(characteristic =>
          bed.characteristics.includes(characteristic),
        )
      })
    : beds
