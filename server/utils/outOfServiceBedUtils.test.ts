import { add, sub } from 'date-fns'
import { outOfServiceBedFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  allOutOfServiceBedsTableHeaders,
  allOutOfServiceBedsTableRows,
  outOfServiceBedCountForToday,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  referenceNumberCell,
} from './outOfServiceBedUtils'
import { getRandomInt } from './utils'
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
        sortHeader<OutOfServiceBedSortField>('Start date', 'outOfServiceFrom', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('End date', 'outOfServiceTo', sortBy, sortDirection, hrefPrefix),
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
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.outOfServiceFrom, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.outOfServiceTo, { format: 'short' }) },
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
        {
          text: 'Manage',
        },
      ])
    })

    it('returns table headers for a non workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(outOfServiceBedTableHeaders(user)).toEqual([
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
          { text: outOfServiceBed.outOfServiceFrom },
          { text: outOfServiceBed.outOfServiceTo },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
          actionCell(outOfServiceBed, premisesId),
        ],
      ]
      const rows = outOfServiceBedTableRows([outOfServiceBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })

    it('returns table rows for a non workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })
      const expectedRows = [
        [
          { text: outOfServiceBed.bed.name },
          { text: outOfServiceBed.room.name },
          { text: outOfServiceBed.outOfServiceFrom },
          { text: outOfServiceBed.outOfServiceTo },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
        ],
      ]
      const rows = outOfServiceBedTableRows([outOfServiceBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })
  })

  describe('outOfServiceBedCountForToday', () => {
    it('returns the correct number of out of service beds for today', () => {
      const outOfServiceBedsForToday = [...Array(getRandomInt(1, 10))].map(() =>
        outOfServiceBedFactory.build({
          outOfServiceFrom: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          outOfServiceTo: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const futureOutOfServiceBeds = [...Array(getRandomInt(1, 10))].map(() =>
        outOfServiceBedFactory.build({
          outOfServiceFrom: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
          outOfServiceTo: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const pastOutOfServiceBeds = [...Array(getRandomInt(1, 10))].map(() =>
        outOfServiceBedFactory.build({
          outOfServiceFrom: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          outOfServiceTo: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )

      expect(
        outOfServiceBedCountForToday([...outOfServiceBedsForToday, ...futureOutOfServiceBeds, ...pastOutOfServiceBeds]),
      ).toEqual(outOfServiceBedsForToday.length)
    })
  })
})
