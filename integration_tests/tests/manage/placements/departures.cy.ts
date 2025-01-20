import { Cas1SpaceBooking } from '@approved-premises/api'
import {
  cas1NewDepartureFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../server/testutils/factories'
import { signIn } from '../../signIn'
import { PlacementShowPage } from '../../../pages/manage'
import departureReasonsJson from '../../../../server/testutils/referenceData/stubs/cas1/departure-reasons.json'
import moveOnCategoriesJson from '../../../../server/testutils/referenceData/stubs/cas1/move-on-categories.json'
import { DepartureNewPage } from '../../../pages/manage/placements/departures/new'
import { BreachOrRecallPage } from '../../../pages/manage/placements/departures/breachOrRecall'
import { NotesPage } from '../../../pages/manage/placements/departures/notes'
import { MoveOnPage } from '../../../pages/manage/placements/departures/moveOn'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../../../server/utils/placements'

context('Departures', () => {
  let placement: Cas1SpaceBooking

  beforeEach(() => {
    const premises = cas1PremisesFactory.build()
    placement = cas1SpaceBookingFactory.current().build({
      premises,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubDepartureReasonsReferenceData', departureReasonsJson)
    cy.task('stubMoveOnCategoriesReferenceData', moveOnCategoriesJson)
    cy.task('stubSpaceBookingDepartureCreate', placement)
  })

  it('lets a user with the correct permissions mark a person as departed', () => {
    const newDeparture = cas1NewDepartureFactory.build({
      reasonId: departureReasonsJson.find(reason => reason.name === 'End of ROTL').id,
      moveOnCategoryId: undefined,
    })

    // Given I am logged in as a user with the correct permissions
    signIn(['future_manager'], ['cas1_space_booking_view', 'cas1_space_booking_record_departure'])

    // When I view a new placement
    const placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Departure' action
    placementPage.clickAction('Record departure')

    // Then I should see the form to record the departure
    const departureNewPage = new DepartureNewPage(placement, newDeparture)
    departureNewPage.shouldShowFormAndExpectedDepartureDate()

    // When I submit the form empty
    departureNewPage.clickContinue()

    // Then I should see errors
    departureNewPage.shouldShowErrorMessagesForFields(['departureDate', 'departureTime', 'reasonId'], {
      departureDate: 'You must enter a date of departure',
      departureTime: 'You must enter a time of departure',
      reasonId: 'You must select a reason',
    })

    // When I complete the form by selecting the 'Breach or recall' for the reason
    departureNewPage.completeForm(BREACH_OR_RECALL_REASON_ID)
    departureNewPage.clickContinue()

    // Then I should see the Breach or recall page
    const breachOrRecallPage = new BreachOrRecallPage(placement, departureReasonsJson)
    breachOrRecallPage.shouldShowFormAndExpectedDepartureDate()

    // When I submit the form empty
    breachOrRecallPage.clickContinue()

    // Then I should see an error
    breachOrRecallPage.shouldShowErrorMessagesForFields(['breachOrRecallReasonId'], {
      breachOrRecallReasonId: 'You must select a breach or recall reason',
    })

    // When I complete the form
    breachOrRecallPage.completeForm()
    breachOrRecallPage.clickContinue()

    // Then I should see the Notes page
    const notesPage = new NotesPage(placement, newDeparture)
    notesPage.shouldShowFormAndExpectedDepartureDate()

    // When I click the back button
    notesPage.clickBack()

    // Then I should see the Breach or recall page with the form populated
    breachOrRecallPage.shouldShowPopulatedForm()

    // When I click the back button
    breachOrRecallPage.clickBack()

    // Then I should see the form to record a departure with the form populated
    departureNewPage.shouldShowPopulatedForm(BREACH_OR_RECALL_REASON_ID)

    // When I select Planned move-on
    departureNewPage.completeForm(PLANNED_MOVE_ON_REASON_ID)
    departureNewPage.clickContinue()

    // Then I should see the Move on page
    const moveOnPage = new MoveOnPage(placement, newDeparture)
    moveOnPage.shouldShowFormAndExpectedDepartureDate()

    // When I submit the form empty
    moveOnPage.clickContinue()

    // Then I should see an error
    moveOnPage.shouldShowErrorMessagesForFields(['moveOnCategoryId'], {
      moveOnCategoryId: 'You must select a move on category',
    })

    // When I complete the form
    moveOnPage.completeForm(moveOnCategoriesJson[0].id)
    moveOnPage.clickContinue()

    // Then I should see the Notes page
    notesPage.shouldShowFormAndExpectedDepartureDate()

    // When I click the back button
    notesPage.clickBack()

    // Then I should see the move-on category page with the form populated
    moveOnPage.shouldShowPopulatedForm(moveOnCategoriesJson[0].id)

    // When I click the back button
    moveOnPage.clickBack()

    // Then I should see the form to record a departure with the form populated
    departureNewPage.shouldShowPopulatedForm(PLANNED_MOVE_ON_REASON_ID)

    // When I complete the form with a reason other than planned move on or breach or recall
    departureNewPage.completeForm()
    departureNewPage.clickContinue()

    // Then I should see the Notes page
    notesPage.shouldShowFormAndExpectedDepartureDate()

    // When I complete the form
    notesPage.completeForm()
    notesPage.clickSubmit()

    // and the API should have been called with the correct data
    notesPage.checkApiCalled()

    // And I see the placement page with a confirmation banner
    placementPage.shouldShowBanner('You have recorded this person as departed')
  })

  it('Requires the correct permission to record a departure', () => {
    // Given I am logged in and have permission to view the placement
    signIn(['future_manager'], ['cas1_space_booking_view'])

    // And I am on the placement page
    const placementPage = PlacementShowPage.visit(placement)

    // Then the record departure option should not be present
    placementPage.actionMenuShouldNotExist()

    // When I navigate to the record departure page directly
    // Then I see an authorisation error
    DepartureNewPage.visitUnauthorised(placement)
  })
})
