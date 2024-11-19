import { signIn } from '../../signIn'
import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'
import { RecordNonArrivalPage } from '../../../pages/manage/placements/nonArrival'

context('Non-arrivals', () => {
  let placement

  beforeEach(() => {
    const premises = cas1PremisesSummaryFactory.build()
    placement = cas1SpaceBookingFactory.upcoming().build({ premises })
    cy.task('stubNonArrivalReasonsReferenceData')
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingNonArrival', placement)
  })

  const errorMessages = {
    notes: 'You have exceeded 200 characters',
    reason: 'You must select a reason for non-arrival',
  }

  it('Records a non-arrival against a placement', () => {
    // Given I am logged in with the correct permissions
    signIn([], ['cas1_space_booking_view', 'cas1_space_booking_record_non_arrival'])

    // And I am on the placement page
    let placementPage = PlacementShowPage.visit(placement)

    // When I click on option to record a non-arrival
    placementPage.clickAction('Record non-arrival')

    // Then it should open the record non-arrival page
    const page = new RecordNonArrivalPage()

    // When I submit the form without selecting a non-arrival reason
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowErrorMessagesForFields(['reason'], errorMessages)

    // When I type too much text into the notes box
    page.completeNotesBad()

    // Then I should see an in-page error
    page.checkForCharacterCountError()

    // When I submit the page
    page.clickSubmit()

    // Then I should see two errors
    page.shouldShowErrorMessagesForFields(['reason', 'notes'], errorMessages)

    // And the text should still be populated
    page.checkForCharacterCountError()

    // When I select a reason and submit the form
    page.completeReason()
    page.clickSubmit()

    // Then I should see the text overflow error (but the reason should remain populated)
    page.shouldShowErrorMessagesForFields(['notes'], errorMessages)

    // When I fix the text overflow and submit the form (given that the reason remained populated)
    page.completeNotesGood()
    page.clickSubmit()

    // Then I should be shown the placement page with a confirmation message
    placementPage = new PlacementShowPage(placement)
    placementPage.shouldShowBanner('You have recorded this person as not arrived')

    // And the booking details should have been sent to the API
    page.checkApiCalled(placement)
  })

  it('Requires the correct permission to record a non-arrival against a placement', () => {
    // Given I am logged in and have permission to view the placement, but not record non-arrival
    signIn([], ['cas1_space_booking_view'])

    // And I am on the placement page
    const placementPage = PlacementShowPage.visit(placement)

    // Then the record non-arrival option should not be present
    placementPage.actionMenuShouldNotExist()

    // When I navigate to the non-arrival page directly
    // Then I see an authorisation error
    RecordNonArrivalPage.visitUnauthorised(placement)
  })
})
