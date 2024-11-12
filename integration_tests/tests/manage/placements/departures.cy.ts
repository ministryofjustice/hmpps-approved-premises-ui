import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
import { signIn } from '../../signIn'
import { PlacementShowPage } from '../../../pages/manage'
import { DepartureNewPage } from '../../../pages/manage/placements/departure'

context('Departures', () => {
  it('lets a user with the correct permissions mark a person as departed', () => {
    const premises = cas1PremisesSummaryFactory.build()
    const placement = cas1SpaceBookingFactory.current().build({
      premises,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubDepartureReasonsReferenceData')

    // Given I am logged in as a user with the correct permissions
    signIn(['future_manager'], ['cas1_space_booking_view', 'cas1_space_booking_record_departure'])

    // When I view a new placement
    const placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Departure' action
    placementPage.clickAction('Record departure')

    // Then I should see the form to record the departure
    const departureNewPage = new DepartureNewPage(placement)
    departureNewPage.shouldShowFormAndExpectedDepartureDate()
  })
})
