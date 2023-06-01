import { bedDetailFactory, bedSummaryFactory } from '../../../server/testutils/factories'

import { BedShowPage, BedsListPage, BookingFindPage, LostBedCreatePage } from '../../pages/manage'
import Page from '../../pages/page'

context('Beds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubLostBedReferenceData')
  })

  it('should allow me to visit a bed from the bed list page', () => {
    const premisesId = 'premisesId'

    // Given I am signed in
    cy.signIn()

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
})
