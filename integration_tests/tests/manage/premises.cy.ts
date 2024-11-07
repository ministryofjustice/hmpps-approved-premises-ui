import {
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'

context('Premises', () => {
  describe('list', () => {
    it('should list all premises', () => {
      cy.task('reset')
      // Given I am logged in as a future manager
      signIn(['future_manager'])
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
    describe('with placement list permission', () => {
      beforeEach(() => {
        cy.task('reset')
        // Given I am logged in as a future manager
        signIn(['future_manager'], ['cas1_space_booking_list'])
      })
      it('should show a single premises details page', () => {
        // Given there is a premises in the database
        const premises = cas1PremisesSummaryFactory.build()
        cy.task('stubSinglePremises', premises)

        // And it has a list of placements
        const placements = cas1SpaceBookingSummaryFactory.buildList(10)
        cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // Then I should see the premises details shown
        page.shouldShowAPArea(premises.apArea.name)
        page.shouldShowPremisesDetail()

        // And I should see a list of placements for the premises
        page.shouldHavePlacementListLengthOf(10)
        page.shouldShowListOfPlacements(placements)
      })

      it('should paginate the placements on the premises details page', () => {
        // Given there is a premises in the database
        const premises = cas1PremisesSummaryFactory.build()
        cy.task('stubSinglePremises', premises)
        // And it has a long list of placements
        const placements = cas1SpaceBookingSummaryFactory.buildList(30)
        cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, pageSize: 9 })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // And I should see the first 9 placements
        page.shouldHavePlacementListLengthOf(9)
        page.shouldShowListOfPlacements(placements.slice(0, 9))

        // And I see a pagination control
        page.shouldHavePaginationControl()
      })

      it('should allow the user to change tab', () => {
        // Given there is a premises in the database
        const premises = cas1PremisesSummaryFactory.build()
        cy.task('stubSinglePremises', premises)
        const placements = cas1SpaceBookingSummaryFactory.buildList(1)
        cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, pageSize: 9 })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // Then the 'upcoming' tab should be selected by default
        page.shouldHaveTabSelected('Upcoming')

        // When I select to the 'current' tab
        page.shouldSelectTab('Current')

        // Then the 'current' tab should be selected
        page.shouldHaveTabSelected('Current')
      })
    })

    it('should not show the placements list if the user lacks permission', () => {
      cy.task('reset')
      // Given I am logged in as a user without access to the booking list
      signIn(['future_manager'])
      // Given there is a premises in the database
      const premises = cas1PremisesSummaryFactory.build()
      cy.task('stubSinglePremises', premises)

      // And it has a list of placements
      const placements = cas1SpaceBookingSummaryFactory.buildList(1)
      cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, pageSize: 9 })

      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)
      page.shouldNotShowPlacementsList()
    })
  })
})
