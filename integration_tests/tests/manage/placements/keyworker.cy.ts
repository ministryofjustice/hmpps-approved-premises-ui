import { signIn } from '../../signIn'
import { KeyworkerAssignmentPage } from '../../../pages/manage/placements/keyworker'
import {
  cas1PremisesSummaryFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
} from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'

context('Keyworker', () => {
  it('Assigns a keyworker to a placement', () => {
    const premises = cas1PremisesSummaryFactory.build()
    const placement = cas1SpaceBookingFactory.build({ premises })
    const staffMembers = staffMemberFactory.buildList(5, { keyWorker: true })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers })
    cy.task('stubSpaceBookingAssignKeyworker', placement)

    // Given I am logged in with the correct permissions
    signIn([], ['cas1_space_booking_view', 'cas1_space_booking_record_keyworker'])

    // And I am on the placement page
    let placementPage = PlacementShowPage.visit(placement)

    // When I click on option to assign a keyworker
    placementPage.clickAction('Assign keyworker')

    // Then I should open the keyworker assignment page
    const page = new KeyworkerAssignmentPage(placement)
    page.shouldShowKeyworkerList(placement)

    // When I submit the form without selecting a keyworker
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowError()

    // When I select a keyworker and submit the form
    page.completeForm(staffMembers[1].name)
    page.clickSubmit()

    // Then I should be shown the placement page with a confirmation message
    placementPage = new PlacementShowPage(placement)
    placementPage.shouldShowBanner('Keyworker assigned')
  })
})
