import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory } from '../../../server/testutils/factories'

import { PlacementShowPage } from '../../pages/manage'

import { signIn } from '../signIn'

context('Placements', () => {
  describe('show', () => {
    it('should show a placement', () => {
      cy.task('reset')
      // Given I am logged in as a future manager
      signIn(['future_manager'], ['cas1_space_booking_view'])
      const premises = cas1PremisesSummaryFactory.build()
      const placement = cas1SpaceBookingFactory.build()
      cy.task('stubSpaceBookingShow', { premisesId: premises.id, placement })
      cy.task('stubSinglePremises', premises)

      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(premises.id, placement)
      // Then I should see the person information in the header
      placementShowPage.shouldShowPersonHeader(placement)
      // And the placement details in the page tables
      placementShowPage.shouldShowSummaryInformation(placement, premises)
    })
  })
})
