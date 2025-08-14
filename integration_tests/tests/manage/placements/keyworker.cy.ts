import { signIn } from '../../signIn'
import {
  DeprecatedKeyworkerAssignmentPage,
  KeyworkerAssignmentPage,
} from '../../../pages/manage/placements/keyworker/new'
import { PlacementShowPage } from '../../../pages/manage'
import {
  cas1CurrentKeyworkerFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
  userSummaryFactory,
} from '../../../../server/testutils/factories'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import Page from '../../../pages/page'
import apiPaths from '../../../../server/paths/api'
import { FindAKeyworkerPage } from '../../../pages/manage/placements/keyworker/find'

const premises = cas1PremisesFactory.build()
const placement = cas1SpaceBookingFactory.upcoming().build({ premises })

const currentKeyworkers = cas1CurrentKeyworkerFactory.buildList(5)
const keyworkerUsers = userSummaryFactory.buildList(5)
const selectedKeyworkerUser = keyworkerUsers[1]
const selectedKeyworker = staffMemberFactory.build(selectedKeyworkerUser)

context('Keyworker', () => {
  beforeEach(() => {
    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingAssignKeyworker', placement)
  })

  it('Assigns an existing keyworker to a placement', () => {
    GIVEN('I am signed in as a future manager with new keyworker flow permission')
    signIn('future_manager', { permissions: ['cas1_experimental_new_assign_keyworker_flow'] })

    AND('I am on the placement page')
    const placementPage = PlacementShowPage.visit(placement)

    WHEN('I click on option to assign a keyworker')
    placementPage.clickAction('Edit keyworker')

    THEN('I should see the keyworker assignment page')
    const keyworkerAssignmentPage = Page.verifyOnPage(KeyworkerAssignmentPage, placement)

    AND('I should see a list of users currently assigned as keyworkers')
    keyworkerAssignmentPage.shouldShowKeyworkersRadios(currentKeyworkers)

    WHEN('I submit the form without selecting a keyworker')
    keyworkerAssignmentPage.clickButton('Submit')

    THEN('I should see an error message')
    keyworkerAssignmentPage.shouldShowErrorMessagesForFields(['keyworker'], {
      keyworker: 'Select a keyworker',
    })

    WHEN('I select a keyworker and submit the form')
    const updatedPlacement = cas1SpaceBookingFactory.withAssignedKeyworker(selectedKeyworker).build(placement)
    cy.task('stubSpaceBookingShow', updatedPlacement)
    keyworkerAssignmentPage.completeForm(selectedKeyworkerUser.name)
    keyworkerAssignmentPage.clickButton('Submit')

    THEN('I should be shown the placement page with a confirmation message')
    Page.verifyOnPage(PlacementShowPage, updatedPlacement)
    placementPage.shouldShowBanner(`
      Keyworker assigned 
      You have assigned ${selectedKeyworkerUser.name} to ${updatedPlacement.person.crn}
    `)

    AND('the API should have been called with the correct parameters')
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
    ).then(body => {
      expect(body).to.deep.equal({ userId: selectedKeyworkerUser.id })
    })
  })

  it('Assigns a new user as a keyworker to a placement', () => {
    const searchQuery = 'Smith'

    const searchParams = {
      permission: 'cas1_keyworker_assignable_as',
      nameOrEmail: searchQuery,
    }
    cy.task('stubUsersSummaries', { users: [], ...searchParams, nameOrEmail: 'No match' })
    cy.task('stubUsersSummaries', { users: keyworkerUsers, ...searchParams })
    cy.task('stubUsersSummaries', { users: keyworkerUsers, ...searchParams, page: '2' })

    GIVEN('I am signed in as a future manager with new keyworker flow permission')
    signIn('future_manager', { permissions: ['cas1_experimental_new_assign_keyworker_flow'] })

    AND('I am on the placement page')
    const placementPage = PlacementShowPage.visit(placement)

    WHEN('I click on option to assign a keyworker')
    placementPage.clickAction('Edit keyworker')

    THEN('I should see the keyworker assignment page')
    const keyworkerAssignmentPage = Page.verifyOnPage(KeyworkerAssignmentPage, placement)

    WHEN('select to assign a different keyworker')
    keyworkerAssignmentPage.completeForm('Assign a different keyworker')
    keyworkerAssignmentPage.clickButton('Submit')

    THEN("I should be shown the 'Find a keyworker' page")
    const findKeyworkerPage = Page.verifyOnPage(FindAKeyworkerPage, placement)

    WHEN('I submit an empty search query')
    findKeyworkerPage.clickButton('Search')

    THEN('I should see an error message')
    findKeyworkerPage.shouldShowErrorMessagesForFields(['nameOrEmail'], {
      nameOrEmail: 'Enter a name or email',
    })

    WHEN('I search for a keyworker who does not exist')
    findKeyworkerPage.completeForm('No match')

    THEN('I should see there are no results')
    findKeyworkerPage.shouldShowNoResults('No match')

    WHEN('I search for a keyworker who exists')
    findKeyworkerPage.completeForm(searchQuery)

    THEN('I should see results')
    findKeyworkerPage.shouldShowResults(keyworkerUsers)

    WHEN('I click to view the second page of results')
    findKeyworkerPage.clickPageNumber('2')

    THEN('I should see results')
    findKeyworkerPage.shouldShowResults(keyworkerUsers)

    WHEN("I click 'Assign keyworker'")
    const updatedPlacement = cas1SpaceBookingFactory.withAssignedKeyworker(selectedKeyworker).build(placement)
    cy.task('stubSpaceBookingShow', updatedPlacement)
    findKeyworkerPage.clickAssignKeyworker(selectedKeyworkerUser.name)

    THEN('I should be shown the placement page with a confirmation message')
    Page.verifyOnPage(PlacementShowPage, updatedPlacement)
    placementPage.shouldShowBanner(`
      Keyworker assigned
      You have assigned ${selectedKeyworkerUser.name} to ${updatedPlacement.person.crn}
    `)

    AND('the API should have been called with the correct parameters')
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
    ).then(body => {
      expect(body).to.deep.equal({ userId: selectedKeyworkerUser.id })
    })
  })

  it('Requires the correct permission to edit a keyworker', () => {
    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')

    AND('I am on the placement page')
    const placementPage = PlacementShowPage.visit(placement)

    THEN('the edit keyworker option should not be present')
    placementPage.actionShouldNotExist('Edit keyworker')

    WHEN('I navigate to the keyworker page directly')
    THEN('I see an authorisation error')
    KeyworkerAssignmentPage.visitUnauthorised(placement)
  })

  // TODO: Remove deprecated test when new flow released (APS-2644)
  describe('if the user does not have the experimental keyworker assignment permission (deprecated flow)', () => {
    const staffMembers = staffMemberFactory.buildList(5, { keyWorker: true })

    beforeEach(() => {
      cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers })
      cy.task('stubPremisesCurrentKeyworkers', { premisesId: premises.id, currentKeyworkers })
    })

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
