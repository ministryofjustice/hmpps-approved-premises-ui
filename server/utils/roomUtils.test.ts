import { roomFactory } from '../testutils/factories'
import { bedTableRows, roomCharacteristicList, roomsTableRows } from './roomUtils'

describe('roomUtils', () => {
  describe('roomsTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const rooms = roomFactory.buildList(1)

      expect(roomsTableRows(rooms, 'premisesId')).toEqual([
        [
          {
            text: rooms[0].name,
          },
          {
            text: rooms[0].beds.length.toString(),
          },
          {
            html: `<a href="/premises/premisesId/rooms/${rooms[0].id}" data-cy-roomId="${rooms[0].id}">Manage <span class="govuk-visually-hidden">Manage room</span></a>`,
          },
        ],
      ])
    })
  })

  describe('bedTableRows', () => {
    it('returns the table rows given the room', () => {
      const room = roomFactory.build({ beds: [{ name: 'bedName', id: 'id' }] })

      expect(bedTableRows(room)).toEqual([
        [
          {
            text: room.beds[0].name,
          },
        ],
      ])
    })
  })

  describe('roomCharacteristicList', () => {
    it('returns the list of room characteristics', () => {
      const room = roomFactory.build({
        characteristics: [
          { name: 'characteristicName', id: 'id', serviceScope: 'approved-premises', modelScope: 'room' },
        ],
      })

      expect(roomCharacteristicList(room)).toMatchStringIgnoringWhitespace(
        `<ul class="govuk-list govuk-list--bullet"><li>Characteristic name</li></ul>`,
      )
    })
  })
})
