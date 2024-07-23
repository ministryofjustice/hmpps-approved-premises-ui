import Page from '../../../pages/page'
import { signIn } from '../../signIn'
import V2BedsListPage from '../../../pages/v2Manage/bed/bedList'
import V2BedShowPage from '../../../pages/v2Manage/bed/bedShow'
import {
  bedDetailFactory,
  bedSummaryFactory,
  extendedPremisesSummaryFactory,
} from '../../../../server/testutils/factories'

context('Beds', () => {
  const premisesId = 'premisesId'
  const bedSummaries = bedSummaryFactory.buildList(5)
  const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })
  const premises = extendedPremisesSummaryFactory.build({ id: premisesId })

  beforeEach(() => {
    cy.task('reset')

    // Given there are beds in the database
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubPremisesSummary', premises)
  })

  it('should allow me to visit a bed from the bed list page', () => {
    // Given I am signed in as a workflow manager
    signIn(['future_manager'])

    // When I visit the V2 beds page
    const v2BedsPage = V2BedsListPage.visit(premisesId)

    // Then I should see all of the beds listed
    v2BedsPage.shouldShowBeds(bedSummaries, premisesId)

    // When I click on a bed
    v2BedsPage.clickBed(bedDetail)

    // Then I should be taken to the bed page
    Page.verifyOnPage(V2BedShowPage, bedDetail.name)

    // Given I'm on the V2 bed page
    const v2BedPage = V2BedShowPage.visit(premisesId, bedDetail)

    // Then I should see the room details
    v2BedPage.shouldShowBedDetails(bedDetail)

    // And I should see a link to the premises
    v2BedPage.shouldLinkToPremises(premises)
  })
})
