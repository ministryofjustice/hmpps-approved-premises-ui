import { Cas1OutOfServiceBed as OutOfServiceBed, Premises } from '@approved-premises/api'
import { TableCell, UserDetails } from '@approved-premises/ui'

import { isWithinInterval } from 'date-fns'
import paths from '../paths/manage'
import { linkTo } from './utils'
import { hasRole } from './users'
import { DateFormats } from './dateUtils'
import { textValue } from './applications/helpers'

export const allOutOfServiceBedsTableRows = (beds: Array<OutOfServiceBed>) => {
  return beds.map(bed => {
    const rows = [
      textValue(bed.premises.name),
      textValue(bed.room.name),
      textValue(bed.bed.name),
      textValue(DateFormats.isoDateToUIDate(bed.outOfServiceFrom, { format: 'short' })),
      textValue(DateFormats.isoDateToUIDate(bed.outOfServiceTo, { format: 'short' })),
      textValue(bed.reason.name),
      referenceNumberCell(bed.referenceNumber),
      textValue(bed.daysLostCount.toString()),
      actionCell(bed, bed.premises.id),
    ]

    return rows
  })
}

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

  if (hasRole(user, 'workflow_manager') || hasRole(user, 'future_manager')) {
    headers.push({
      text: 'Manage',
    })
  }

  return headers
}

export const outOfServiceBedTableRows = (beds: Array<OutOfServiceBed>, premisesId: string, user: UserDetails) => {
  return beds.map(bed => {
    const rows = [
      textValue(bed.bed.name),
      textValue(bed.room.name),
      textValue(bed.outOfServiceFrom),
      textValue(bed.outOfServiceTo),
      textValue(bed.reason.name),
      referenceNumberCell(bed.referenceNumber),
    ]

    if (hasRole(user, 'workflow_manager') || hasRole(user, 'future_manager')) {
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
      start: DateFormats.isoToDateObj(outOfServiceBed.outOfServiceFrom),
      end: DateFormats.isoToDateObj(outOfServiceBed.outOfServiceTo),
    }),
  ).length
}

const bedLink = (bed: OutOfServiceBed, premisesId: Premises['id']): string =>
  linkTo(
    paths.v2Manage.outOfServiceBeds.show,
    { id: bed.id, bedId: bed.bed.id, premisesId },
    {
      text: 'View',
      hiddenText: `Out of service bed ${bed.bed.name}`,
      attributes: { 'data-cy-bedId': bed.bed.id },
    },
  )
