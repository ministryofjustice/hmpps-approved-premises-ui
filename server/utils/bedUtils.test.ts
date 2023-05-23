import { bedSummaryFactory } from '../testutils/factories'
import { actionCell, bedNameCell, bedTableRows, roomNameCell, statusCell } from './bedUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bed = bedSummaryFactory.build()

  describe('roomNameCell', () => {
    it('returns the name of the room', () => {
      expect(roomNameCell(bed)).toEqual({ text: bed.roomName })
    })
  })

  describe('bedNameCell', () => {
    it('returns the name of the room', () => {
      expect(bedNameCell(bed)).toEqual({ text: bed.name })
    })
  })

  describe('statusCell', () => {
    it('returns the status of an available room in sentence case', () => {
      bed.status = 'available'

      expect(statusCell(bed)).toEqual({ text: 'Available' })
    })

    it('returns the status of an occupied room in sentence case', () => {
      bed.status = 'occupied'

      expect(statusCell(bed)).toEqual({ text: 'Occupied' })
    })

    it('returns the status of an out of service room in sentence case', () => {
      bed.status = 'out_of_service'

      expect(statusCell(bed)).toEqual({ text: 'Out of service' })
    })
  })

  describe('actionCell', () => {
    it('returns a link to manage the room', () => {
      expect(actionCell(bed, premisesId)).toEqual({
        html: `<a href="/premises/${premisesId}/beds/${bed.id}" data-cy-bedId="${bed.id}">Manage <span class="govuk-visually-hidden">bed ${bed.name}</span></a>`,
      })
    })
  })

  describe('roomsTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const beds = [bed]

      expect(bedTableRows(beds, premisesId)).toEqual([
        [roomNameCell(bed), bedNameCell(bed), statusCell(bed), actionCell(bed, premisesId)],
      ])
    })
  })
})
