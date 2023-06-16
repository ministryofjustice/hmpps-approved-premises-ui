import { LostBed } from '@approved-premises/api'
import { TableCell } from '@approved-premises/ui'

import paths from '../paths/manage'
import { linkTo } from './utils'

export const lostBedTableRows = (beds: Array<LostBed>, premisesId: string) => {
  return beds.map(bed => [
    textCell(bed.bedName),
    textCell(bed.roomName),
    textCell(bed.startDate),
    textCell(bed.endDate),
    textCell(bed.reason.name),
    referenceNumberCell(bed.referenceNumber),
    actionCell(bed, premisesId),
  ])
}

export const textCell = (value: string): TableCell => ({ text: value })
export const referenceNumberCell = (value: string): TableCell => ({ text: value || 'Not provided' })
export const actionCell = (bed: LostBed, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

const bedLink = (bed: LostBed, premisesId: string): string =>
  linkTo(
    paths.lostBeds.show,
    { id: bed.id, bedId: bed.bedId, premisesId },
    {
      text: 'Manage',
      hiddenText: `lost bed ${bed.bedName}`,
      attributes: { 'data-cy-lostBedId': bed.id },
    },
  )
