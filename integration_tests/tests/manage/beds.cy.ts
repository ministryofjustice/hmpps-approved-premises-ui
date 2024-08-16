import { bedDetailFactory, bedSummaryFactory, lostBedFactory } from '../../../server/testutils/factories'

import { BedShowPage, BedsListPage, LostBedCreatePage, LostBedListPage } from '../../pages/manage'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('Beds', () => {
  const premisesId = 'premisesId'
  const bedSummaries = bedSummaryFactory.buildList(5)
  const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLostBedReferenceData')

    // Given there are beds in the database
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })
  })

  it('should allow me to visit a bed from the bed list page and mark it out of service', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    // When I visit the rooms page
    const bedsPage = BedsListPage.visit(premisesId)

    // Then I should see all of the rooms listed
    bedsPage.shouldShowBeds(bedSummaries, premisesId)

    // When I click on a bed
    bedsPage.clickBed(bedDetail)

    // Then I should be taken to the bed page
    Page.verifyOnPage(BedShowPage)

    // Give I'm on the bed page
    const bedPage = BedShowPage.visit(premisesId, bedDetail)

    // Then I should see the room details
    bedPage.shouldShowBedDetails(bedDetail)

    // When I click on the link to mark the bed out of service
    bedPage.clickOutOfServiceBedOption()

    // Then I am taken to the mark bed out of service page
    Page.verifyOnPage(LostBedCreatePage)
  })

  it('should allow me to manage out of service beds from the bed list page', () => {
    // Given there is a lost bed in the database
    const lostBed = lostBedFactory.build()
    cy.task('stubLostBed', { premisesId, lostBed })
    cy.task('stubLostBedsList', { premisesId, lostBeds: [lostBed] })
    cy.task('stubLostBedUpdate', { premisesId, lostBed })

    // And I am signed in as a workflow manager
    signIn(['workflow_manager'])

    // When I visit the rooms page
    const bedsPage = BedsListPage.visit(premisesId)

    // And I click on manage out of service beds
    bedsPage.clickManageOutOfServiceBeds()

    // Then I should see the list of out of service beds
    Page.verifyOnPage(LostBedListPage)
  })
})
