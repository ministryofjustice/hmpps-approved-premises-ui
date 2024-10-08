import { outOfServiceBedFactory, outOfServiceBedRevisionFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  allOutOfServiceBedsTableHeaders,
  allOutOfServiceBedsTableRows,
  bedRevisionDetails,
  outOfServiceBedCount,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  overwriteOoSBedWithUserInput,
  referenceNumberCell,
  sortOutOfServiceBedRevisionsByUpdatedAt,
} from './outOfServiceBedUtils'
import { ApprovedPremisesUserRole, Cas1OutOfServiceBedSortField as OutOfServiceBedSortField } from '../@types/shared'
import { sortHeader } from './sortHeader'

describe('outOfServiceBedUtils', () => {
  const managerRoles: ReadonlyArray<ApprovedPremisesUserRole> = ['workflow_manager', 'future_manager'] as const

  describe('allOutOfServiceBedsTableHeaders', () => {
    it('returns the table headers', () => {
      const sortBy = 'bedName'
      const sortDirection = 'asc'
      const hrefPrefix = 'http://example.com'

      expect(allOutOfServiceBedsTableHeaders(sortBy, sortDirection, hrefPrefix)).toEqual([
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
      ])
    })
  })

  describe('allOutOfServiceBedsTableRows', () => {
    const outOfServiceBed = outOfServiceBedFactory.build()

    it('returns table rows', () => {
      const expectedRows = [
        [
          { text: outOfServiceBed.premises.name },
          { text: outOfServiceBed.room.name },
          { text: outOfServiceBed.bed.name },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.endDate, { format: 'short' }) },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
          { text: outOfServiceBed.daysLostCount.toString() },
          actionCell(outOfServiceBed, outOfServiceBed.premises.id),
        ],
      ]
      const rows = allOutOfServiceBedsTableRows([outOfServiceBed])
      expect(rows).toEqual(expectedRows)
    })
  })

  describe('referenceNumberCell', () => {
    it('returns ref number', () => {
      const refNumber = '123'
      expect(referenceNumberCell(refNumber)).toEqual({ text: refNumber })
    })
    it('returns text if no ref number', () => {
      expect(referenceNumberCell(undefined)).toEqual({ text: 'Not provided' })
    })
  })

  describe('outOfServiceBedTableHeaders', () => {
    it.each(managerRoles)('returns table headers for a %s', role => {
      const user = userDetailsFactory.build({ roles: [role] })

      expect(outOfServiceBedTableHeaders(user)).toEqual([
        {
          text: 'Bed',
        },
        {
          text: 'Room',
        },
        {
          text: 'Start date',
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
        {
          text: 'Manage',
        },
      ])
    })

    it('returns table headers for a user who is not a manager', () => {
      const user = userDetailsFactory.build({ roles: [] })

      expect(outOfServiceBedTableHeaders(user)).toEqual([
        {
          text: 'Bed',
        },
        {
          text: 'Room',
        },
        {
          text: 'Start date',
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
      ])
    })
  })

  describe('outOfServiceBedTableRows', () => {
    const outOfServiceBed = outOfServiceBedFactory.build({ referenceNumber: '123' })
    const premisesId = 'premisesId'

    it.each(managerRoles)('returns table rows for a %s', role => {
      const user = userDetailsFactory.build({ roles: [role] })

      const expectedRows = [
        [
          { text: outOfServiceBed.bed.name },
          { text: outOfServiceBed.room.name },
          { text: outOfServiceBed.startDate },
          { text: outOfServiceBed.endDate },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
          actionCell(outOfServiceBed, premisesId),
        ],
      ]
      const rows = outOfServiceBedTableRows([outOfServiceBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })

    it('returns table rows for a user who is not a manager', () => {
      const user = userDetailsFactory.build({ roles: [] })
      const expectedRows = [
        [
          { text: outOfServiceBed.bed.name },
          { text: outOfServiceBed.room.name },
          { text: outOfServiceBed.startDate },
          { text: outOfServiceBed.endDate },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
        ],
      ]
      const rows = outOfServiceBedTableRows([outOfServiceBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })
  })

  describe('outOfServiceBedCount', () => {
    describe('when the count is 0', () => {
      it('returns a plural string', () => {
        expect(outOfServiceBedCount(0)).toEqual('0 beds')
      })
    })

    describe('when the count is 1', () => {
      it('returns a singular string', () => {
        expect(outOfServiceBedCount(1)).toEqual('1 bed')
      })
    })

    describe('when the count is 2', () => {
      it('returns a plural string', () => {
        expect(outOfServiceBedCount(2)).toEqual('2 beds')
      })
    })
  })

  describe('bedRevisionDetails', () => {
    it('adds a formatted start date the summary list', () => {
      const startDate = new Date(2024, 2, 1)
      const revision = outOfServiceBedRevisionFactory.build({
        startDate: DateFormats.dateObjToIsoDate(startDate),
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([
          { key: { text: 'Start date' }, value: { text: DateFormats.dateObjtoUIDate(startDate) } },
        ]),
      )
    })

    it('adds a formatted end date the summary list', () => {
      const endDate = new Date(2024, 2, 1)
      const revision = outOfServiceBedRevisionFactory.build({
        endDate: DateFormats.dateObjToIsoDate(endDate),
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'End date' }, value: { text: DateFormats.dateObjtoUIDate(endDate) } }]),
      )
    })

    it('adds a reason the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({
        reason: { id: 'reasonId', name: 'reasonName' },
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Reason' }, value: { text: revision.reason.name } }]),
      )
    })

    it('adds a reference the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({
        referenceNumber: '123',
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Reference number' }, value: { text: revision.referenceNumber } }]),
      )
    })

    it('adds a notes item to the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({ notes: 'some note' })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Notes' }, value: { text: 'some note' } }]),
      )
    })
  })

  describe('sortOutOfServiceBedRevisionsByUpdatedAt', () => {
    it('sorts revisions by updatedAt in descending order', () => {
      const earliestDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-01T00:00:00Z' })
      const middleDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-02T00:00:00Z' })
      const latestDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-03T00:00:00Z' })

      const unsortedRevisions = [earliestDate, latestDate, middleDate]

      const sortedRevisions = sortOutOfServiceBedRevisionsByUpdatedAt(unsortedRevisions)

      expect(sortedRevisions).toEqual([latestDate, middleDate, earliestDate])
    })
  })

  describe('overwriteOoSBedWithUserInput', () => {
    it('overwrites the reason ID if there is a reason in the userInput', () => {
      const userInput = { outOfServiceBed: { reason: 'new reason' } }
      const outOfServiceBed = outOfServiceBedFactory.build()

      expect(overwriteOoSBedWithUserInput(userInput, outOfServiceBed)).toEqual(
        expect.objectContaining({
          reason: expect.objectContaining({ id: 'new reason' }),
        }),
      )
    })

    it('overwrites the reference number if there is a reason in the userInput', () => {
      const userInput = { outOfServiceBed: { referenceNumber: 'new reason' } }
      const outOfServiceBed = outOfServiceBedFactory.build()

      expect(overwriteOoSBedWithUserInput(userInput, outOfServiceBed)).toEqual(
        expect.objectContaining({ referenceNumber: 'new reason' }),
      )
    })
  })
})
