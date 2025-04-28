import { signIn } from '../../signIn'
import { KeyworkerAssignmentPage } from '../../../pages/manage/placements/keyworker'
import { PlacementShowPage } from '../../../pages/manage'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
} from '../../../../server/testutils/factories'

const premises = cas1PremisesFactory.build()
const placement = cas1SpaceBookingFactory.upcoming().build({ premises })
const staffMembers = staffMemberFactory.buildList(5, { keyWorker: true })

context('Keyworker', () => {
  beforeEach(() => {
    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers })
    cy.task('stubSpaceBookingAssignKeyworker', placement)
  })

  it('Assigns a keyworker to a placement', () => {
    // Given I am signed in as a future manager
    signIn('future_manager')

    // And I am on the placement page
    let placementPage = PlacementShowPage.visit(placement)

    // When I click on option to assign a keyworker
    placementPage.clickAction('Edit keyworker')

    // Then I should open the keyworker assignment page
    const page = new KeyworkerAssignmentPage(placement, staffMembers)
    page.shouldShowKeyworkerList(placement)

    // When I submit the form without selecting a keyworker
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowError()

    // When I select a keyworker and submit the form
    page.completeForm()
    page.clickSubmit()

    // Then I should be shown the placement page with a confirmation message
    placementPage = new PlacementShowPage(placement)
    placementPage.shouldShowBanner('Keyworker assigned')

    // And the API should have been called with the correct parameters
    page.checkApiCalled(placement)
  })

  it('Requires the correct permission to edit a keyworker', () => {
    // Given I am signed in as a CRU member
    signIn('cru_member')

    // And I am on the placement page
    const placementPage = PlacementShowPage.visit(placement)

    // Then the record non-arrival option should not be present
    placementPage.actionMenuShouldNotExist()

    // When I navigate to the keyworker page directly
    // Then I see an authorisation error
    KeyworkerAssignmentPage.visitUnauthorised(placement)
  })
})
