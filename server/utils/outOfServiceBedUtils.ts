import { Premises } from '@approved-premises/api'
import { OutOfServiceBed, TableCell, UserDetails } from '@approved-premises/ui'

import { isWithinInterval } from 'date-fns'
import paths from '../paths/manage'
import { linkTo } from './utils'
import { hasRole } from './users'
import { DateFormats } from './dateUtils'
import { textValue } from './applications/helpers'

export const outOfServiceBedTableHeaders = (user: UserDetails) => {
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

  if (hasRole(user, 'workflow_manager')) {
    headers.push({
      text: 'Manage',
    })
  }

  return headers
}

export const outOfServiceBedTableRows = (beds: Array<OutOfServiceBed>, premisesId: string, user: UserDetails) => {
  return beds.map(bed => {
    const rows = [
      textValue(bed.bedName),
      textValue(bed.roomName),
      textValue(bed.startDate),
      textValue(bed.endDate),
      textValue(bed.reason.name),
      referenceNumberCell(bed.referenceNumber),
    ]

    if (hasRole(user, 'workflow_manager')) {
      rows.push(actionCell(bed, premisesId))
    }

    return rows
  })
}

export const referenceNumberCell = (value: string): TableCell => ({ text: value || 'Not provided' })
export const actionCell = (bed: OutOfServiceBed, premisesId: Premises['id']): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const outOfServiceBedCountForToday = (outOfServiceBeds: Array<OutOfServiceBed>): number => {
  return outOfServiceBeds.filter(outOfServiceBed =>
    isWithinInterval(Date.now(), {
      start: DateFormats.isoToDateObj(outOfServiceBed.startDate),
      end: DateFormats.isoToDateObj(outOfServiceBed.endDate),
    }),
  ).length
}

const bedLink = (bed: OutOfServiceBed, premisesId: Premises['id']): string =>
  linkTo(
    paths.outOfServiceBeds.show,
    { id: bed.id, bedId: bed.bedId, premisesId },
    {
      text: 'Manage',
      hiddenText: `Out of service bed ${bed.bedName}`,
      attributes: { 'data-cy-bedId': bed.id },
    },
  )
