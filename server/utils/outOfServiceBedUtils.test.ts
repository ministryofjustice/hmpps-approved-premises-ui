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

describe('outOfServiceBedUtils', () => {
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
    it('returns table headers for a workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

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

    it('returns table rows for a workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      const expectedRows = [
        [
          { text: outOfServiceBed.bedName },
          { text: outOfServiceBed.roomName },
          { text: outOfServiceBed.startDate },
          { text: outOfServiceBed.endDate },
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
          { text: outOfServiceBed.bedName },
          { text: outOfServiceBed.roomName },
          { text: outOfServiceBed.startDate },
          { text: outOfServiceBed.endDate },
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
          startDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const futureOutOfServiceBeds = [...Array(getRandomInt(1, 10))].map(() =>
        outOfServiceBedFactory.build({
          startDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const pastOutOfServiceBeds = [...Array(getRandomInt(1, 10))].map(() =>
        outOfServiceBedFactory.build({
          startDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )

      expect(
        outOfServiceBedCountForToday([...outOfServiceBedsForToday, ...futureOutOfServiceBeds, ...pastOutOfServiceBeds]),
      ).toEqual(outOfServiceBedsForToday.length)
    })
  })
})