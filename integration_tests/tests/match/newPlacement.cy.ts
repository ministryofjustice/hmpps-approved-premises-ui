import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { signIn } from '../signIn'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import { cas1PlacementRequestDetailFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import NewPlacementPage from '../../pages/match/newPlacement/newPlacementPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import CheckCriteriaPage from '../../pages/match/newPlacement/checkCriteriaPage'

context('New Placement', () => {
  let placementRequest: Cas1PlacementRequestDetail

  beforeEach(() => {
    cy.task('reset')

    placementRequest = cas1PlacementRequestDetailFactory.build()
    cy.task('stubPlacementRequest', placementRequest)
  })

  it('allows me to create a new placement', () => {
    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')

    WHEN('I view a placement request')
    const placementRequestPage = ShowPage.visit(placementRequest)

    AND("I click on the 'Create New Placement' action")
    placementRequestPage.clickAction('Create new placement')

    THEN('I should see the page to create a new placement')
    const newPlacementPage = Page.verifyOnPage(NewPlacementPage, placementRequest)

    WHEN('I submit the form with no values')
    newPlacementPage.clickButton('Save and continue')

    THEN('I should see error messages')
    newPlacementPage.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'reason'], {
      startDate: 'Enter or select an arrival date',
      endDate: 'Enter or select a departure date',
      reason: 'Enter a reason',
    })

    WHEN('I complete the form')
    const startDate = faker.date.future()
    const endDate = addDays(startDate, 10)
    newPlacementPage.completeForm({
      startDate: DateFormats.dateObjtoUIDate(startDate, { format: 'datePicker' }),
      endDate: DateFormats.dateObjtoUIDate(endDate, { format: 'datePicker' }),
      reason: faker.word.words(10),
    })
    newPlacementPage.clickButton('Save and continue')

    THEN('I should see the page to check placement criteria')
    Page.verifyOnPage(CheckCriteriaPage, placementRequest)

    WHEN('I submit the form with no values')
    THEN('I should see an error message')

    WHEN('I complete the form')
    THEN('I should see the form to update placement criteria')

    WHEN('I complete the form')
    THEN('I should see the suitability search page with the new placement information')

    // Add a test for filtering results or consider this covered in main suitability search integration test?

    WHEN('I click on a result')
    THEN('I should see the occupancy view for the premises with the new placement information')

    // Add a test for filtering view or consider this covered in main occupancy view integration test?

    WHEN('I submit the form with no values')
    THEN('I should see error messages')

    WHEN('I complete the form')
    THEN('I should see the page to confirm the new placement')

    WHEN('I confirm the new placement')
    THEN('I should see the placement request page')
    AND('I should see a confirmation banner')
    AND('The new placement details should be shown')
  })
})
