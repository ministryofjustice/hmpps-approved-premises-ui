import { Room } from '../@types/shared'
import { TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo } from './utils'

export const roomsTableRows = (rooms: Array<Room>, premisesId: string) => {
  const mappedRooms = rooms.map(room => [nameCell(room), numberOfBedsCell(room), actionCell(room, premisesId)])
  return mappedRooms
}
const nameCell = (room: Room): TableCell => ({ text: room.name })

const numberOfBedsCell = (room: Room): TableCell => ({ text: room.beds.length.toString() })

const actionCell = (room: Room, premisesId: string): TableCell => ({
  html: roomLink(room, premisesId),
})

const roomLink = (room: Room, premisesId: string): string =>
  linkTo(
    paths.premises.room,
    { roomId: room.id, premisesId },
    {
      text: 'Manage',
      hiddenText: 'Manage room',
      attributes: { 'data-cy-roomId': room.id },
    },
  )
