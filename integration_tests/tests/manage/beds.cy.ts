import { bedDetailFactory, bedSummaryFactory, lostBedFactory } from '../../../server/testutils/factories'

import { BedShowPage, BedsListPage, BookingFindPage, LostBedCreatePage, LostBedListPage } from '../../pages/manage'
import Page from '../../pages/page'

context('Beds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubLostBedReferenceData')

    // Given I am signed in
    cy.signIn()
  })

  it('should allow me to visit a bed from the bed list page', () => {
    const premisesId = 'premisesId'

    // And there are bed in the database
    const bedSummaries = bedSummaryFactory.buildList(5)
    const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })

    // When I visit the rooms page
    const bedsPage = BedsListPage.visit(premisesId)

    // Then I should see all of the rooms listed
    bedsPage.shouldShowBeds(bedSummaries, premisesId)

    // When I click on a bed
    bedsPage.clickBed(bedDetail)

    // Then I should be taken to the bed page
    Page.verifyOnPage(BedShowPage)

    // When I visit the bed page
    const bedPage = BedShowPage.visit(premisesId, bedDetail)

    // Then I should see the room details
    bedPage.shouldShowBedDetails(bedDetail)

    // And I should be able to create a booking
    bedPage.clickCreateBookingOption()

    // Then I should be taken to the bed page
    Page.verifyOnPage(BookingFindPage)

    // Given I go back
    cy.go('back')

    // When I click on the link to mark the bed out of service
    bedPage.clickLostBedsOption()

    // Then I am taken to the mark bed out of service page
    Page.verifyOnPage(LostBedCreatePage)
  })

  it('should allow me to manage out of service beds from the bed list page', () => {
    const premisesId = 'premisesId'

    // And there are beds and a lost bed in the database
    const bedSummaries = bedSummaryFactory.buildList(5)
    const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })

    const lostBed = lostBedFactory.build()
    cy.task('stubLostBed', { premisesId, lostBed })
    cy.task('stubLostBedsList', { premisesId, lostBeds: [lostBed] })
    cy.task('stubLostBedUpdate', { premisesId, lostBed })

    // When I visit the rooms page
    const bedsPage = BedsListPage.visit(premisesId)

    // And I click on manage out of service beds
    bedsPage.clickManageLostBeds()

    // Then I should see the list of out of service beds
    Page.verifyOnPage(LostBedListPage)
  })
})
