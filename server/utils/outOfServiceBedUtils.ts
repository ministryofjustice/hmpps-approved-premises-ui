import {
  Cas1NewOutOfServiceBed,
  Cas1OutOfServiceBed,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedReason,
  Cas1OutOfServiceBedRevision,
  Cas1OutOfServiceBedSortField as OutOfServiceBedSortField,
  Premises,
  SortDirection,
} from '@approved-premises/api'
import {
  type BespokeError,
  type EntityType,
  type IdentityBarMenu,
  IdentityBarMenuItem,
  ObjectWithDateParts,
  SummaryList,
  SummaryListItem,
  TableCell,
  UserDetails,
} from '@approved-premises/ui'

import { isBefore } from 'date-fns'
import paths from '../paths/manage'
import { linkTo } from './utils'
import { DateFormats, isoDateIsValid } from './dateUtils'
import { textValue } from './applications/helpers'
import { sortHeader } from './sortHeader'
import { hasPermission } from './users'
import { SanitisedError } from '../sanitisedError'
import { summaryListItem } from './formUtils'
import { isValidCrn } from './crn'
import { ValidationError } from './errors'

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
      text: 'Reference/CRN',
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
  { text: 'Reference/CRN' },
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
): Array<IdentityBarMenu> => {
  const cancelItem = {
    text: 'Cancel out of service bed',
    href: paths.outOfServiceBeds.cancel({ premisesId, id, bedId }),
  }

  const updateItem = {
    text: 'Update out of service bed',
    href: paths.outOfServiceBeds.update({ premisesId, id, bedId }),
  }

  const items: Array<IdentityBarMenuItem> = [
    hasPermission(user, ['cas1_out_of_service_bed_cancel']) && cancelItem,
    hasPermission(user, ['cas1_out_of_service_bed_create']) && updateItem,
  ].filter(Boolean)

  return items.length ? [{ items }] : null
}

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

export const outOfServiceBedSummaryList = (outOfServiceBed: Cas1OutOfServiceBed): SummaryList => ({
  rows: [
    summaryListItem('Start date', DateFormats.isoDateToUIDate(outOfServiceBed.startDate, { format: 'long' })),
    summaryListItem('End date', DateFormats.isoDateToUIDate(outOfServiceBed.endDate, { format: 'long' })),
    summaryListItem('Reason', outOfServiceBed.reason.name),
    summaryListItem('Reference/CRN', outOfServiceBed.referenceNumber),
    summaryListItem('Notes', outOfServiceBed.notes, 'textBlock'),
  ],
})

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
      key: textValue('Reference/CRN'),
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

type ConflictingEntityType = EntityType

type ParsedConflictError = {
  conflictingEntityId: string
  conflictingEntityType: ConflictingEntityType
}

export const generateConflictBespokeError = (
  err: SanitisedError,
  premisesId: string,
  datesGrammaticalNumber: 'plural' | 'singular',
  bedId?: string,
): BespokeError => {
  const { detail } = err.data as { detail: string }
  const { conflictingEntityId, conflictingEntityType } = parseConflictError(detail)

  const title = (
    conflictingEntityType === 'lost-bed'
      ? 'Out of service bed record cannot be created for the $date$ entered'
      : 'This bedspace is not available for the $date$ entered'
  ).replace('$date$', datesGrammaticalNumber === 'plural' ? 'dates' : 'date')

  const link =
    conflictingEntityType === 'lost-bed' && bedId
      ? `<a href="${paths.outOfServiceBeds.show({
          premisesId,
          bedId,
          id: conflictingEntityId,
          tab: 'details',
        })}">existing out of service beds record</a>`
      : `<a href="${paths.premises.placements.show({
          premisesId,
          placementId: conflictingEntityId,
        })}">existing booking</a>`
  const message = datesGrammaticalNumber === 'plural' ? `They conflict with an ${link}` : `It conflicts with an ${link}`

  return { errorTitle: title, errorSummary: [{ html: message }] }
}

const parseConflictError = (detail: string): ParsedConflictError => {
  /**
   *  Return the entity type and id by parsing an error detail string
   *  @param detail - string is text containing the entity id at the end preceded by ': '
   *    e.g. "An out-of-service bed already exists for dates from 2024-10-01 to 2024-10-14 which overlaps with the desired dates: 220a71da-bf5c-424d-94ff-254ecac5b857"
   */
  const [message, conflictingEntityId] = detail.split(':').map((s: string) => s.trim())
  const conflictingEntityType = message.includes('out-of-service bed') ? 'lost-bed' : 'booking'
  return { conflictingEntityId, conflictingEntityType }
}

export type CreateOutOfServiceBedBody = ObjectWithDateParts<'startDate'> &
  ObjectWithDateParts<'endDate'> & {
    reason?: string
    referenceNumber?: string
    notes?: string
  }

export const validateOutOfServiceBedInput = (
  body: CreateOutOfServiceBedBody,
  outOfServiceBedReasons: Array<Cas1OutOfServiceBedReason>,
  bedId?: string,
): Cas1NewOutOfServiceBed => {
  const { startDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'startDate')
  const { endDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'endDate')
  const { reason, referenceNumber, notes } = body

  const errors: Partial<Record<keyof CreateOutOfServiceBedBody, string>> = {}

  if (!startDate) {
    errors.startDate = 'You must enter a start date'
  } else if (!isoDateIsValid(startDate)) {
    errors.startDate = 'You must enter a valid start date'
  }

  if (!endDate) {
    errors.endDate = 'You must enter an end date'
  } else if (!isoDateIsValid(endDate)) {
    errors.endDate = 'You must enter a valid end date'
  }

  if (!errors.startDate && !errors.endDate && isBefore(endDate, startDate)) {
    errors.endDate = 'The end date must be on or after the start date'
  }

  if (!reason) {
    errors.reason = 'You must select a reason'
  } else if (outOfServiceBedReasons.find(data => data.id === reason)?.referenceType === 'crn') {
    if (!referenceNumber) {
      errors.referenceNumber = 'You must enter a CRN'
    } else if (!isValidCrn(referenceNumber)) {
      errors.referenceNumber = 'You must enter a valid CRN'
    }
  }

  if (!notes) {
    errors.notes = 'You must provide detail on why the bed is out of service'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors)
  }

  return { bedId, startDate, endDate, reason, referenceNumber, notes }
}
