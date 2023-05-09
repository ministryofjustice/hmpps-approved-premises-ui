import { roomFactory } from '../../../server/testutils/factories'

import { RoomsListPage } from '../../pages/manage'

context('Rooms', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list all rooms', () => {
    const premisesId = 'premisesId'

    // Given I am signed in
    cy.signIn()

    // And there are rooms in the database
    const rooms = roomFactory.buildList(5)
    cy.task('stubRooms', { premisesId, rooms })

    // When I visit the rooms page
    const page = RoomsListPage.visit(premisesId)

    // Then I should see all of the rooms listed
    page.shouldShowRooms(rooms, premisesId)
  })
})
