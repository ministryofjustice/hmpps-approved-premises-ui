import { roomFactory } from '../../../server/testutils/factories'

import { BookingFindPage, RoomsListPage } from '../../pages/manage'
import RoomsShowPage from '../../pages/manage/roomShow'
import Page from '../../pages/page'

context('Rooms', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should allow me to visit a room from the room list page', () => {
    const premisesId = 'premisesId'

    // Given I am signed in
    cy.signIn()

    // And there are rooms in the database
    const rooms = roomFactory.buildList(5)
    const room = rooms[0]
    cy.task('stubRooms', { premisesId, rooms })
    cy.task('stubRoom', { premisesId, room })

    // When I visit the rooms page
    const roomsPage = RoomsListPage.visit(premisesId)

    // Then I should see all of the rooms listed
    roomsPage.shouldShowRooms(rooms, premisesId)

    // When I click on a room

    roomsPage.clickRoom(room)

    // Then I should be taken to the room page
    Page.verifyOnPage(RoomsShowPage)

    // When I visit the room page
    const roomPage = RoomsShowPage.visit(premisesId, room.id)

    // Then I should see the room details
    roomPage.shouldShowBeds(room.beds)
    roomPage.shouldShowCharacteristics(room.characteristics)

    // And I should be able to click on a bed
    roomPage.clickBedLink(room.beds[0].name)

    // Then I should be taken to the bed page
    Page.verifyOnPage(BookingFindPage)
  })
})
