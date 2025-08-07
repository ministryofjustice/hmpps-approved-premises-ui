import { signIn } from '../../signIn'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  nonArrivalReasonsFactory,
} from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'
import { RecordNonArrivalPage } from '../../../pages/manage/placements/nonArrival'
import { NON_ARRIVAL_REASON_OTHER_ID } from '../../../../server/utils/placements'

context('Non-arrivals', () => {
  let placement
  const nonArrivalReasons = nonArrivalReasonsFactory.buildList(5)
  nonArrivalReasons[4].id = NON_ARRIVAL_REASON_OTHER_ID

  beforeEach(() => {
    const premises = cas1PremisesFactory.build()
    placement = cas1SpaceBookingFactory.upcoming().build({ premises })

    cy.task('stubNonArrivalReasonsReferenceData', nonArrivalReasons)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingNonArrival', placement)
  })

  const errorMessages = {
    notes: 'You have exceeded 200 characters',
    reason: 'You must select a reason for non-arrival',
  }

  it('Records a non-arrival against a placement', () => {
    // Given I am signed in as a future manager
    signIn('future_manager')

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

    // When I submit the form
    page.clickSubmit()

    // Then I should see two errors
    page.shouldShowErrorMessagesForFields(['reason', 'notes'], errorMessages)

    // And the text should still be populated
    page.checkForCharacterCountError()

    // When I clear the notes, select 'Other' as the non-arrival reason and submit
    page.getTextInputByIdAndClear('notes')
    page.checkRadioByNameAndValue('reason', NON_ARRIVAL_REASON_OTHER_ID)
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowErrorMessagesForFields(['notes'], { notes: 'You must provide the reason for non-arrival' })

    // When I populate the notes field and submit
    page.completeNotesGood()
    page.clickSubmit()

    // Then I should be shown the placement page with a confirmation message
    placementPage = new PlacementShowPage(placement)
    placementPage.shouldShowBanner('You have recorded this person as not arrived')

    // And the booking details should have been sent to the API
    page.checkApiCalled(placement)
  })

  it('Requires the correct permission to record a non-arrival against a placement', () => {
    // Given I am signed in as a CRU member
    signIn('cru_member')

    // And I am on the placement page
    const placementPage = PlacementShowPage.visit(placement)

    // Then the record non-arrival option should not be present
    placementPage.actionShouldNotExist('Record non-arrival')

    // When I navigate to the non-arrival page directly
    // Then I see an authorisation error
    RecordNonArrivalPage.visitUnauthorised(placement)
  })
})
