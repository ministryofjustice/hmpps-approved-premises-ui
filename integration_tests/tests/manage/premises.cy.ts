import {
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    // Given I am logged in as a future manager
    signIn(['future_manager'])
  })

  describe('list', () => {
    it('should list all premises', () => {
      const premises = premisesSummaryFactory.buildList(5)
      cy.task('stubAllPremises', premises)
      cy.task('stubCas1AllPremises', premises)
      cy.task('stubApAreaReferenceData')

      // When I visit the premises page
      const v2PremisesListPage = PremisesListPage.visit()

      // Then I should see all of the premises listed
      v2PremisesListPage.shouldShowPremises(premises)
    })
  })

  describe('show', () => {
    it('should show a single premises', () => {
      // Given there is a premises in the database
      const premises = cas1PremisesSummaryFactory.build()
      cy.task('stubSinglePremises', premises)
      const placements = cas1SpaceBookingSummaryFactory.buildList(5)
      cy.task('stubSpaceBookingSummary', { premisesId: premises.id, placements })

      // When I visit premises page
      const page = PremisesShowPage.visit(premises)

      // Then I should see the premises details shown
      page.shouldShowAPArea(premises.apArea.name)
      page.shouldShowPremisesDetail()
      page.shouldShowListOfPlacements(placements)
      page.shouldHaveTabSelected('Upcoming')
    })
  })
})
