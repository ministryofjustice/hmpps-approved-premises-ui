import Page from '../../../pages/page'
import { signIn } from '../../signIn'
import BedsListPage from '../../../pages/manage/bed/bedList'
import BedShowPage from '../../../pages/manage/bed/bedShow'
import { bedDetailFactory, bedSummaryFactory, cas1PremisesSummaryFactory } from '../../../../server/testutils/factories'

context('Beds', () => {
  const premisesId = 'premisesId'
  const bedSummaries = bedSummaryFactory.buildList(5)
  const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })
  const premises = cas1PremisesSummaryFactory.build({ id: premisesId })

  beforeEach(() => {
    cy.task('reset')

    // Given there are beds in the database
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubSinglePremises', premises)
  })

  it('should allow me to visit a bed from the bed list page', () => {
    // Given I am signed in as a workflow manager
    signIn(['future_manager'])

    // When I visit the beds page
    const bedsPage = BedsListPage.visit(premisesId)

    // Then I should see all of the beds listed
    bedsPage.shouldShowBeds(bedSummaries, premisesId)

    // And I should have a link to view all of this premises' out-of-service beds
    bedsPage.shouldIncludeLinkToAllPremisesOutOfServiceBeds(premisesId)

    // When I click on a bed
    bedsPage.clickBed(bedDetail)

    // Then I should be taken to the bed page
    Page.verifyOnPage(BedShowPage, bedDetail.name)

    // Given I'm on the bed page
    const bedPage = BedShowPage.visit(premisesId, bedDetail)

    // Then I should see the room details
    bedPage.shouldShowBedDetails(bedDetail)

    // And I should see a link to the premises
    bedPage.shouldLinkToPremises(premises)
  })
})
