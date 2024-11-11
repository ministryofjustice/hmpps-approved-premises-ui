import { ApprovedPremisesUserPermission, Cas1SpaceBookingDates, FullPerson } from '@approved-premises/api'
import { cas1SpaceBookingFactory } from '../../../../server/testutils/factories'

import { PlacementShowPage } from '../../../pages/manage'

import { signIn } from '../../signIn'

context('Placements', () => {
  describe('show', () => {
    const setup = (permissions: Array<ApprovedPremisesUserPermission>, placementParameters = {}) => {
      cy.task('reset')
      signIn(['future_manager'], permissions)
      const placement = cas1SpaceBookingFactory.build(placementParameters)
      cy.task('stubSpaceBookingShow', placement)
      return {
        placement,
      }
    }

    it('should show a placement', () => {
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement } = setup(['cas1_space_booking_view'])
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see the person information in the header
      placementShowPage.shouldShowPersonHeader(placement.person as FullPerson)
      // And the placement details in the page tables
      placementShowPage.shouldShowSummaryInformation(placement)
    })

    it('should show a placement with missing fields', () => {
      // Given I am logged in with permission to view a placement
      // And the mocked placement has missing data
      const { placement } = setup(['cas1_space_booking_view'], {
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
      })
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see greyed rows in the page tables
      placementShowPage.shouldNotShowUnpopulatedRows(placement, ['Actual arrival date', 'Actual departure date'])
      placementShowPage.shouldShowSummaryInformation(placement)
    })

    it('should show a list of linked placements', () => {
      const placementList = [
        { id: '1234', canonicalArrivalDate: '2024-06-10', canonicalDepartureDate: '2024-09-10' },
        { id: '1235', canonicalArrivalDate: '2026-01-02', canonicalDepartureDate: '2027-03-04' },
      ] as Array<Cas1SpaceBookingDates>
      const { placement } = setup(['cas1_space_booking_view'], {
        otherBookingsInPremisesForCrn: placementList,
      })

      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then the linked placement
      placementShowPage.shouldShowLinkedPlacements([
        'Placement 10 Jun 2024 to 10 Sep 2024',
        'Placement 02 Jan 2026 to 04 Mar 2027',
      ])
    })

    it('should require the correct permission to view a placement', () => {
      // Given I am logged in with permission to view a placement and a mocked placement
      const { placement } = setup([])
      // When I visit the placement page
      // I should get an authorsation error
      PlacementShowPage.visitUnauthorised(placement)
    })
  })
})
