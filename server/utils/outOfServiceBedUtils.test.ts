import { add, sub } from 'date-fns'
import { outOfServiceBedFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  outOfServiceBedCountForToday,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  referenceNumberCell,
} from './outOfServiceBedUtils'
import { getRandomInt } from './utils'
import { ApprovedPremisesUserRole } from '../@types/shared'

describe('outOfServiceBedUtils', () => {
  const managerRoles: ReadonlyArray<ApprovedPremisesUserRole> = ['workflow_manager', 'future_manager'] as const

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
    const outOfServiceBed = outOfServiceBedFactory.build()
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
          { text: outOfServiceBed.referenceNumber },
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
          { text: outOfServiceBed.referenceNumber },
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
