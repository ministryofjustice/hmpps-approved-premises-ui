import { add, sub } from 'date-fns'
import { lostBedFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  lostBedTableHeaders,
  lostBedTableRows,
  lostBedsCountForToday,
  referenceNumberCell,
} from './lostBedUtils'
import { getRandomInt } from './utils'

describe('lostBedUtils', () => {
  describe('referenceNumberCell', () => {
    it('returns ref number', () => {
      const refNumber = '123'
      expect(referenceNumberCell(refNumber)).toEqual({ text: refNumber })
    })
    it('returns text if no ref number', () => {
      expect(referenceNumberCell(undefined)).toEqual({ text: 'Not provided' })
    })
  })

  describe('lostBedTableHeaders', () => {
    it('returns table headers for a workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      expect(lostBedTableHeaders(user)).toEqual([
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

      expect(lostBedTableHeaders(user)).toEqual([
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

  describe('lostBedTableRows', () => {
    const lostBed = lostBedFactory.build()
    const premisesId = 'premisesId'

    it('returns table rows for a workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      const expectedRows = [
        [
          { text: lostBed.bedName },
          { text: lostBed.roomName },
          { text: lostBed.startDate },
          { text: lostBed.endDate },
          { text: lostBed.reason.name },
          { text: lostBed.referenceNumber },
          actionCell(lostBed, premisesId),
        ],
      ]
      const rows = lostBedTableRows([lostBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })

    it('returns table rows for a non workflow manager', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })
      const expectedRows = [
        [
          { text: lostBed.bedName },
          { text: lostBed.roomName },
          { text: lostBed.startDate },
          { text: lostBed.endDate },
          { text: lostBed.reason.name },
          { text: lostBed.referenceNumber },
        ],
      ]
      const rows = lostBedTableRows([lostBed], premisesId, user)
      expect(rows).toEqual(expectedRows)
    })
  })

  describe('lostBedsCountForToday', () => {
    it('returns the correct number of lost beds for today', () => {
      const lostBedsForToday = [...Array(getRandomInt(1, 10))].map(() =>
        lostBedFactory.build({
          startDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const futureLostBeds = [...Array(getRandomInt(1, 10))].map(() =>
        lostBedFactory.build({
          startDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(add(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )
      const pastLostBeds = [...Array(getRandomInt(1, 10))].map(() =>
        lostBedFactory.build({
          startDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
          endDate: DateFormats.dateObjToIsoDate(sub(Date.now(), { days: getRandomInt(1, 10) })),
        }),
      )

      expect(lostBedsCountForToday([...lostBedsForToday, ...futureLostBeds, ...pastLostBeds])).toEqual(
        lostBedsForToday.length,
      )
    })
  })
})
