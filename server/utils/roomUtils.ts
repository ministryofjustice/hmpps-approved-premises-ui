import { Bed, Room } from '../@types/shared'
import { TableCell } from '../@types/ui'
import paths from '../paths/manage'
import { linkTo, sentenceCase } from './utils'

export const roomsTableRows = (rooms: Array<Room>, premisesId: string) => {
  const mappedRooms = rooms.map(room => [nameCell(room), numberOfBedsCell(room), actionCell(room, premisesId)])
  return mappedRooms
}

const nameCell = (item: { name: string }): TableCell => ({ text: item.name })

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

export const bedTableRows = (room: Room, premisesId: string) => {
  const mappedBeds = room.beds.map(bed => [nameCell(bed), bookCell(bed, premisesId), lostCell(bed, premisesId)])
  return mappedBeds
}

const bookCell = (bed: Bed, premisesId: string): TableCell => ({
  html: bookingLink(bed, premisesId),
})

const bookingLink = (bed: Bed, premisesId: string): string =>
  linkTo(
    paths.bookings.new,
    { bedId: bed.id, premisesId },
    {
      text: 'Book bed',
      hiddenText: 'Book bed',
      attributes: { 'data-cy-bedId': bed.id },
    },
  )

const lostCell = (bed: Bed, premisesId: string): TableCell => ({
  html: lostLink(bed, premisesId),
})

const lostLink = (bed: Bed, premisesId: string): string =>
  linkTo(
    paths.lostBeds.new,
    { bedId: bed.id, premisesId },
    {
      text: 'Mark bed as out of service',
      hiddenText: 'Mark bed as out of service',
      attributes: { 'data-cy-bedId': bed.id },
    },
  )

export const roomCharacteristicList = (room: Room) =>
  `<ul class="govuk-list govuk-list--bullet">
  ${room.characteristics.map(characteristic => `<li>${sentenceCase(characteristic.name)}</li>`).join(' ')}</ul>`
