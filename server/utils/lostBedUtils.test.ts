import { lostBedFactory, userDetailsFactory } from '../testutils/factories'
import { lostBedTableHeaders, lostBedTableRows, referenceNumberCell } from './lostBedUtils'

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
          {
            html: `<a href="/premises/${premisesId}/beds/${lostBed.bedId}/lost-beds/${lostBed.id}" data-cy-lostBedId="${lostBed.id}">Manage <span class="govuk-visually-hidden">lost bed ${lostBed.bedName}</span></a>`,
          },
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
})
