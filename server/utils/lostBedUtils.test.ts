import { lostBedFactory } from '../testutils/factories'
import { lostBedTableRows, referenceNumberCell } from './lostBedUtils'

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

  describe('lostBedTableRows', () => {
    it('returns table rows', () => {
      const lostBed = lostBedFactory.build()
      const premisesId = 'premisesId'
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
      const rows = lostBedTableRows([lostBed], premisesId)
      expect(rows).toEqual(expectedRows)
    })
  })
})
