import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { signIn } from '../signIn'

context('New Placement', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('allows me to create a new placement', () => {
    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')

    WHEN('I view a placement request')
    AND("I click on the 'Create New Placement' action")
    THEN('I should see the form to create a new placement')

    WHEN('I submit the form with no values')
    THEN('I should see error messages')

    WHEN('I complete the form')
    THEN('I should see the page to check placement criteria')

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
