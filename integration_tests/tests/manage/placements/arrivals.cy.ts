import { signIn } from '../../signIn'
import { ArrivalCreatePage } from '../../../pages/manage/placements/arrival'
import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'

context('Arrivals', () => {
  it('lets a future manager mark a placement as arrived', () => {
    const premises = cas1PremisesSummaryFactory.build()
    const placement = cas1SpaceBookingFactory.upcoming().build({
      premises,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingArrivalCreate', { premisesId: premises.id, placementId: placement.id })

    // Given I am logged in as a future manager
    signIn(['future_manager'], ['cas1_space_booking_view', 'cas1_space_booking_record_arrival'])

    // When I view a new placement
    let placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Arrived' action
    placementPage.clickAction('Record arrival')

    // Then I should see the form to record the arrival
    const arrivalCreatePage = new ArrivalCreatePage(placement)
    arrivalCreatePage.shouldShowFormAndExpectedArrivalDate()

    // When I submit the form with the arrival details
    arrivalCreatePage.completeForm()
    arrivalCreatePage.clickSubmit()

    // Then I should be shown the placement page with a confirmation that the placement has been marked as arrived
    placementPage = new PlacementShowPage(placement)
    placementPage.shouldShowBanner('You have recorded this person as arrived')
  })
})
