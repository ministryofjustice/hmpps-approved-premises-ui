import { roomFactory } from '../testutils/factories'
import { tableRows } from './roomUtils'

describe('roomUtils', () => {
  describe('tableRows', () => {
    it('returns the table rows given the rooms', () => {
      const rooms = roomFactory.buildList(1)

      expect(tableRows(rooms, 'premisesId')).toEqual([
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
})
