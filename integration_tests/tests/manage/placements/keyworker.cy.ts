import { signIn } from '../../signIn'
import { DeprecatedKeyworkerAssignmentPage } from '../../../pages/manage/placements/keyworker'
import { PlacementShowPage } from '../../../pages/manage'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
} from '../../../../server/testutils/factories'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'

const premises = cas1PremisesFactory.build()
const placement = cas1SpaceBookingFactory.upcoming().build({ premises })
const staffMembers = staffMemberFactory.buildList(5, { keyWorker: true })
// const users = userFactory.buildList(5, { permissions: [] })

context('Keyworker', () => {
  beforeEach(() => {
    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers })
    cy.task('stubSpaceBookingAssignKeyworker', placement)
  })

  // TODO: APS-2661
  // it('Assigns an existing keyworker to a placement', () => {
  //   GIVEN('I am signed in as a future manager with new keyworker flow permission')
  //   signIn('future_manager', { permissions: ['cas1_experimental_new_assign_keyworker_flow'] })
  //
  //   AND('I am on the placement page')
  //   let placementPage = PlacementShowPage.visit(placement)
  //
  //   WHEN('I click on option to assign a keyworker')
  //   placementPage.clickAction('Edit keyworker')
  //
  //   THEN('I should open the keyworker assignment page')
  //   const page = new KeyworkerAssignmentPage()
  //
  //   WHEN('I submit the form without selecting a keyworker')
  //   page.clickSubmit()
  //
  //   THEN('I should see an error message')
  //   page.shouldShowErrorMessagesForFields(['keyworker'], {
  //     keyworker: 'Select a keyworker',
  //   })
  //
  //   WHEN('I select a keyworker and submit the form')
  //   page.completeForm(users[1].id)
  //   page.clickSubmit()
  //
  //   THEN('I should be shown the placement page with a confirmation message')
  //   placementPage = new PlacementShowPage(placement)
  //   placementPage.shouldShowBanner('Keyworker assigned')
  //
  //   AND('the API should have been called with the correct parameters')
  //   cy.task(
  //     'verifyApiPost',
  //     apiPaths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
  //   ).then(body => {
  //     expect(body).to.deep.equal({ userId: users[1].id })
  //   })
  // })

  // TODO: APS-2660
  // it('Assigns a new user as a keyworker to a placement', () => {
  //   const allUsers = userFactory.buildList(15)
  //
  //   GIVEN('am signed in as a future manager with new keyworker flow permission')
  //   signIn('future_manager', { permissions: ['cas1_experimental_new_assign_keyworker_flow'] })
  //
  //   AND('am on the placement page')
  //   let placementPage = PlacementShowPage.visit(placement)
  //
  //   WHEN('click on option to assign a keyworker')
  //   placementPage.clickAction('Edit keyworker')
  //
  //   THEN('should open the keyworker assignment page')
  //   const page = new KeyworkerAssignmentPage(users)
  //
  //   WHEN('select to assign a different keyworker')
  //   page.completeForm('new')
  //   page.clickSubmit()
  //
  //   THEN('should be shown the 'Find a keyworker' page')
  //
  //   WHEN('search for a keyworker')
  //
  //   AND('click 'Assign keyworker'')
  //
  //   THEN('should be shown the placement page with a confirmation message')
  //   placementPage = new PlacementShowPage(placement)
  //   placementPage.shouldShowBanner('Keyworker assigned')
  //
  //   AND('e API should have been called with the correct parameters')
  //   cy.task(
  //     'verifyApiPost',
  //     apiPaths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
  //   ).then(body => {
  //     expect(body).to.deep.equal({ userId: users[1].id })
  //   })
  // })

  // TODO: APS-2661/APS-2660
  // it('Requires the correct permission to edit a keyworker', () => {
  //   GIVEN('I am signed in as a CRU member')
  //   signIn('cru_member')
  //
  //   AND('I am on the placement page')
  //   const placementPage = PlacementShowPage.visit(placement)
  //
  //   THEN('the record non-arrival option should not be present')
  //   placementPage.actionShouldNotExist('Edit keyworker')
  //
  //   WHEN('I navigate to the keyworker page directly')
  //   THEN('I see an authorisation error')
  //   KeyworkerAssignmentPage.visitUnauthorised(placement)
  // })

  // TODO: Remove deprecated test when new flow released (APS-2644)
  describe('if the user does not have the experimental keyworker assignment permission', () => {
    it('Assigns a keyworker to a placement', () => {
      GIVEN('I am signed in as a future manager')
      signIn('future_manager')

      AND('I am on the placement page')
      let placementPage = PlacementShowPage.visit(placement)

      WHEN('I click on option to assign a keyworker')
      placementPage.clickAction('Edit keyworker')

      THEN('I should open the deprecated keyworker assignment page')
      const page = new DeprecatedKeyworkerAssignmentPage(placement, staffMembers)
      page.shouldShowKeyworkerList(placement)

      WHEN('I submit the form without selecting a keyworker')
      page.clickSubmit()

      THEN('I should see an error message')
      page.shouldShowError()

      WHEN('I select a keyworker and submit the form')
      page.completeForm()
      page.clickSubmit()

      THEN('I should be shown the placement page with a confirmation message')
      placementPage = new PlacementShowPage(placement)
      placementPage.shouldShowBanner('Keyworker assigned')

      AND('the API should have been called with the correct parameters')
      page.checkApiCalled(placement)
    })

    it('Requires the correct permission to edit a keyworker', () => {
      GIVEN('I am signed in as a CRU member')
      signIn('cru_member')

      AND('I am on the placement page')
      const placementPage = PlacementShowPage.visit(placement)

      THEN('the record non-arrival option should not be present')
      placementPage.actionShouldNotExist('Edit keyworker')

      WHEN('I navigate to the keyworker page directly')
      THEN('I see an authorisation error')
      DeprecatedKeyworkerAssignmentPage.visitUnauthorised(placement)
    })
  })
})
