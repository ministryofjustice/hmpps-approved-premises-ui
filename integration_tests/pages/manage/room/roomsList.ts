import { Room } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class RoomsListPage extends Page {
  constructor() {
    super('Manage rooms')
  }

  static visit(premisesId: string): RoomsListPage {
    cy.visit(paths.premises.rooms({ premisesId }))
    return new RoomsListPage()
  }

  shouldShowRooms(rooms: Array<Room>, premisesId: string): void {
    rooms.forEach((item: Room) => {
      cy.contains(item.name)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.beds.length.toString())
          cy.get('td')
            .eq(1)
            .contains('Manage')
            .should('have.attr', 'href', paths.premises.room({ roomId: item.id, premisesId }))
        })
    })
  }

  clickRoom(room: Room): void {
    cy.contains(room.name).click()
  }
}
