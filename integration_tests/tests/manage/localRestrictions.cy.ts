import { faker } from '@faker-js/faker'
import { signIn } from '../signIn'
import { cas1PremisesFactory, staffMemberFactory } from '../../../server/testutils/factories'
import { PremisesShowPage } from '../../pages/manage'
import Page from '../../pages/page'
import { LocalRestrictionsPage } from '../../pages/manage/localRestrictions/localRestrictionsList'
import { LocalRestrictionAddPage } from '../../pages/manage/localRestrictions/localRestrictionAdd'

describe('Local restrictions', () => {
  const premises = cas1PremisesFactory.build({ localRestrictions: [] })
  const keyworkers = staffMemberFactory.keyworker().buildList(5)

  beforeEach(() => {
    cy.task('reset')

    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers: keyworkers })
    cy.task('stubSpaceBookingSummaryList', {
      premisesId: premises.id,
      placements: [],
      residency: 'current',
      sortBy: 'personName',
      sortDirection: 'asc',
      perPage: 2000,
    })

    cy.log('Given I am signed in as a Future manager')
    // TODO: Change role to 'future_manager' when feature is released
    signIn('janitor')
  })

  it('lets me see and manage a list of local restrictions for a premises', () => {
    cy.log('When I visit the premises page')
    const premisesPage = PremisesShowPage.visit(premises)

    cy.log('And I click on the Manage local restrictions action')
    premisesPage.clickAction('Manage local restrictions')

    cy.log('Then I should see the local restrictions page')
    const restrictionsPage = Page.verifyOnPage(LocalRestrictionsPage, premises)

    cy.log("And I should see a details component with the premises' criteria")
    restrictionsPage.shouldExpandDetails('View criteria for this Approved Premises')
    // TODO: add criteria to Cas1Premises
    cy.contains('Premises criteria TBD').should('be.visible')

    cy.log('And I should see no local restrictions for the premises')
    restrictionsPage.shouldShowNoRestrictions()

    cy.log('When I click on Add a restriction')
    restrictionsPage.clickLink('Add a restriction')

    cy.log('Then I should see the form to add a restriction')
    const addRestrictionsPage = Page.verifyOnPage(LocalRestrictionAddPage, premises)

    cy.log('When I submit the form empty')
    addRestrictionsPage.completeForm('')

    cy.log('Then I should see an error')
    addRestrictionsPage.shouldShowErrorMessagesForFields(['description'], {
      description: 'Enter details for the restriction',
    })

    cy.log('When I submit a restriction that is more than 100 characters long')
    addRestrictionsPage.completeForm(faker.word.words(20))

    cy.log('Then I should see an error')
    addRestrictionsPage.shouldShowErrorMessagesForFields(['description'], {
      description: 'The restriction must be less than 100 characters long',
    })

    cy.log('When I submit a valid restriction')
    // const newRestriction = cas1PremisesNewLocalRestriction.build()
    // addRestrictionsPage.completeForm(newRestriction.description)

    cy.log('Then the new restriction should have been saved')
    // cy.task('verifyApiPost', apiPaths.premises.localRestrictions.create({ premisesId: premises.id })).then(
    //   ({ description }) => {
    //     expect(description).equal(newRestriction.description)
    //   },
    // )

    // const restriction = cas1PremisesLocalRestrictionSummary.build({
    //   description: newRestriction.description,
    // })
    // cy.task('stubSinglePremises', { ...premises, localRestrictions: [restriction] })

    cy.log('Then I should see the list of restrictions')
    // restrictionsPage.shouldShowRestrictions([restriction])

    cy.log('And I should see a confirmation the restriction has been added')
    // restrictionsPage.shouldShowBanner('The restriction has been added.')

    cy.log('When I click on Remove next to a restriction')
    // restrictionsPage.clickLink('Remove')

    cy.log('Then the restriction should have been removed')
    // cy.task(
    //   'verifyApiDelete',
    //   apiPaths.premises.localRestrictions.delete({
    //     premisesId: premises.id,
    //     localRestrictionId: restriction.id,
    //   }),
    // )

    cy.log('Then I should see a confirmation the restriction has been removed')
    // restrictionsPage.shouldShowBanner('The restriction has been removed.')

    cy.log('And I should see no local restrictions for the premises')
    // restrictionsPage.shouldShowNoRestrictions()
  })
})
