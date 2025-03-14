import {
  Cas1OutOfServiceBedRevision,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  Premises,
  SortDirection,
} from '@approved-premises/api'
import { type IdentityBarMenu, SummaryList, SummaryListItem, TableCell, UserDetails } from '@approved-premises/ui'

import paths from '../paths/manage'
import { linkTo } from './utils'
import { DateFormats } from './dateUtils'
import { textValue } from './applications/helpers'
import { sortHeader } from './sortHeader'
import { hasPermission } from './users'

export const premisesIndexTabs = (premisesId: string, temporality: 'current' | 'future' | 'past') => [
  {
    text: 'Current',
    href: paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }),
    active: temporality === 'current',
  },
  {
    text: 'Future',
    href: paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'future' }),
    active: temporality === 'future',
  },
  {
    text: 'Historic',
    href: paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'past' }),
    active: temporality === 'past',
  },
]

export const allOutOfServiceBedsTableHeaders = (
  sortBy: OutOfServiceBedSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return [
    sortHeader<OutOfServiceBedSortField>('Premises', 'premisesName', sortBy, sortDirection, hrefPrefix),
    sortHeader<OutOfServiceBedSortField>('Room', 'roomName', sortBy, sortDirection, hrefPrefix),
    sortHeader<OutOfServiceBedSortField>('Bed', 'bedName', sortBy, sortDirection, hrefPrefix),
    sortHeader<OutOfServiceBedSortField>('Start date', 'startDate', sortBy, sortDirection, hrefPrefix),
    sortHeader<OutOfServiceBedSortField>('End date', 'endDate', sortBy, sortDirection, hrefPrefix),
    sortHeader<OutOfServiceBedSortField>('Reason', 'reason', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Ref number',
    },
    sortHeader<OutOfServiceBedSortField>('Days lost', 'daysLost', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Actions',
    },
  ]
}

export const allOutOfServiceBedsTableRows = (beds: Array<OutOfServiceBed>) =>
  beds.map(bed => [
    textValue(bed.premises.name),
    textValue(bed.room.name),
    textValue(bed.bed.name),
    textValue(DateFormats.isoDateToUIDate(bed.startDate, { format: 'short' })),
    textValue(DateFormats.isoDateToUIDate(bed.endDate, { format: 'short' })),
    textValue(bed.reason.name),
    referenceNumberCell(bed.referenceNumber),
    textValue(bed.daysLostCount.toString()),
    actionCell(bed, bed.premises.id),
  ])

export const outOfServiceBedTableHeaders = () => [
  { text: 'Bed' },
  { text: 'Room' },
  { text: 'Start date' },
  { text: 'End date' },
  { text: 'Reason' },
  { text: 'Ref number' },
  { text: 'Details' },
]

export const outOfServiceBedTableRows = (beds: Array<OutOfServiceBed>, premisesId: string) =>
  beds.map(bed => [
    textValue(bed.bed.name),
    textValue(bed.room.name),
    textValue(DateFormats.isoDateToUIDate(bed.startDate, { format: 'short' })),
    textValue(DateFormats.isoDateToUIDate(bed.endDate, { format: 'short' })),
    textValue(bed.reason.name),
    referenceNumberCell(bed.referenceNumber),
    actionCell(bed, premisesId),
  ])

export const referenceNumberCell = (value: string): TableCell => ({ text: value || 'Not provided' })
export const actionCell = (bed: OutOfServiceBed, premisesId: Premises['id']): TableCell => ({
  html: bedLink(bed, premisesId),
})

const bedLink = (bed: OutOfServiceBed, premisesId: Premises['id']): string =>
  linkTo(paths.outOfServiceBeds.show({ id: bed.id, bedId: bed.bed.id, premisesId, tab: 'details' }), {
    text: 'View',
    hiddenText: `Out of service bed ${bed.bed.name}`,
    attributes: { 'data-cy-bedId': bed.bed.id },
  })

export const outOfServiceBedActions = (
  user: UserDetails,
  premisesId: string,
  bedId: string,
  id: string,
): Array<IdentityBarMenu> =>
  hasPermission(user, ['cas1_out_of_service_bed_create'])
    ? [
        {
          items: [
            {
              text: 'Cancel out of service bed',
              href: paths.outOfServiceBeds.cancel({ premisesId, id, bedId }),
            },
            {
              text: 'Update out of service bed',
              href: paths.outOfServiceBeds.update({ premisesId, id, bedId }),
            },
          ],
        },
      ]
    : null

export const outOfServiceBedTabs = (
  premisesId: string,
  bedId: string,
  id: string,
  activeTab: 'details' | 'timeline',
) => [
  {
    text: 'Details',
    href: paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
    active: activeTab === 'details',
  },
  {
    text: 'Timeline',
    href: paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'timeline' }),
    active: activeTab === 'timeline',
  },
]

export const bedRevisionDetails = (revision: Cas1OutOfServiceBedRevision): SummaryList['rows'] => {
  const summaryListItems: Array<SummaryListItem> = []

  if (revision.startDate) {
    summaryListItems.push({
      key: textValue('Start date'),
      value: textValue(DateFormats.isoDateToUIDate(revision.startDate, { format: 'long' })),
    })
  }

  if (revision.endDate) {
    summaryListItems.push({
      key: textValue('End date'),
      value: textValue(DateFormats.isoDateToUIDate(revision.endDate, { format: 'long' })),
    })
  }

  if (revision.reason) {
    summaryListItems.push({
      key: textValue('Reason'),
      value: textValue(revision.reason.name),
    })
  }

  if (revision.referenceNumber) {
    summaryListItems.push({
      key: textValue('Reference number'),
      value: textValue(revision.referenceNumber),
    })
  }

  if (revision.notes) {
    summaryListItems.push({
      key: textValue('Notes'),
      value: textValue(revision.notes),
    })
  }

  return summaryListItems
}

export const sortOutOfServiceBedRevisionsByUpdatedAt = (revisions: Array<Cas1OutOfServiceBedRevision>) => {
  return revisions.sort((a, b) => {
    return a.updatedAt > b.updatedAt ? -1 : 1
  })
}

export const overwriteOoSBedWithUserInput = (userInput: Record<string, unknown>, outOfServiceBed: OutOfServiceBed) => {
  if (userInput.outOfServiceBed && (userInput.outOfServiceBed as Record<string, string>)?.referenceNumber) {
    outOfServiceBed.referenceNumber = (userInput.outOfServiceBed as Record<string, string>)?.referenceNumber
  }

  if (
    (userInput?.outOfServiceBed as Record<string, string>)?.reason &&
    typeof (userInput.outOfServiceBed as Record<string, string>)?.reason === 'string'
  ) {
    outOfServiceBed.reason.id = (userInput.outOfServiceBed as Record<string, string>).reason
  }

  return outOfServiceBed
}
