import { LostBed } from '@approved-premises/api'
import { TableCell, UserDetails } from '@approved-premises/ui'

import { isWithinInterval } from 'date-fns'
import paths from '../paths/manage'
import { linkTo } from './utils'
import { hasPermission } from './users'
import { DateFormats } from './dateUtils'

export const lostBedTableHeaders = (user: UserDetails) => {
  const headers = [
    {
      text: 'Bed',
    },
    {
      text: 'Room',
    },
    {
      text: 'Out of service from',
    },
    {
      text: 'Out of service until',
    },
    {
      text: 'Reason',
    },
    {
      text: 'Ref number',
    },
  ]

  if (hasPermission(user, ['cas1_out_of_service_bed_create'])) {
    headers.push({
      text: 'Manage',
    })
  }

  return headers
}

export const lostBedTableRows = (beds: Array<LostBed>, premisesId: string, user: UserDetails) => {
  return beds.map(bed => {
    const rows = [
      textCell(bed.bedName),
      textCell(bed.roomName),
      textCell(bed.startDate),
      textCell(bed.endDate),
      textCell(bed.reason.name),
      referenceNumberCell(bed.referenceNumber),
    ]

    if (hasPermission(user, ['cas1_out_of_service_bed_create'])) {
      rows.push(actionCell(bed, premisesId))
    }

    return rows
  })
}

export const textCell = (value: string): TableCell => ({ text: value })
export const referenceNumberCell = (value: string): TableCell => ({ text: value || 'Not provided' })
export const actionCell = (bed: LostBed, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const lostBedsCountForToday = (lostBeds: Array<LostBed>): number => {
  return lostBeds.filter(lostBed =>
    isWithinInterval(Date.now(), {
      start: DateFormats.isoToDateObj(lostBed.startDate),
      end: DateFormats.isoToDateObj(lostBed.endDate),
    }),
  ).length
}

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
