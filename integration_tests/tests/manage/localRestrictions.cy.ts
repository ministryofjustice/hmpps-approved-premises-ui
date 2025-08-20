import { faker } from '@faker-js/faker'
import { signIn } from '../signIn'
import {
  cas1PremisesFactory,
  cas1PremisesLocalRestrictionSummaryFactory,
  cas1PremisesNewLocalRestrictionFactory,
} from '../../../server/testutils/factories'
import { PremisesShowPage } from '../../pages/manage'
import Page from '../../pages/page'
import { LocalRestrictionsPage } from '../../pages/manage/localRestrictions/localRestrictionsList'
import { LocalRestrictionAddPage } from '../../pages/manage/localRestrictions/localRestrictionAdd'
import apiPaths from '../../../server/paths/api'
import { LocalRestrictionConfirmRemovePage } from '../../pages/manage/localRestrictions/localRestrictionConfirmRemove'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

describe('Local restrictions', () => {
  const premises = cas1PremisesFactory.build({ localRestrictions: [] })

  beforeEach(() => {
    cy.task('reset')

    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesCurrentKeyworkers', { premisesId: premises.id })
    cy.task('stubSpaceBookingSummaryList', {
      premisesId: premises.id,
      placements: [],
      residency: 'current',
      sortBy: 'personName',
      sortDirection: 'asc',
      perPage: 2000,
    })

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')
  })

  it('lets me see and manage a list of local restrictions for a premises', () => {
    WHEN('I visit the premises page')
    const premisesPage = PremisesShowPage.visit(premises)

    AND('I click on the Manage local restrictions action')
    premisesPage.clickAction('Manage local restrictions')

    THEN('I should see the local restrictions page')
    const restrictionsPage = Page.verifyOnPage(LocalRestrictionsPage, premises)

    AND("I should see a details component with the premises' criteria")
    restrictionsPage.shouldExpandDetails('View AP criteria')
    restrictionsPage.shouldShowPremisesCharacteristics()

    AND('I should see no local restrictions for the premises')
    restrictionsPage.shouldShowNoRestrictions()

    WHEN('I click on Add a restriction')
    restrictionsPage.clickLink('Add a restriction')

    THEN('I should see the form to add a restriction')
    const addRestrictionsPage = Page.verifyOnPage(LocalRestrictionAddPage, premises)

    AND('the field should have a character count')
    addRestrictionsPage.shouldShowCharacterCount('description', 100)

    WHEN('I submit the form empty')
    addRestrictionsPage.completeForm('')

    THEN('I should see an error')
    addRestrictionsPage.shouldShowErrorMessagesForFields(['description'], {
      description: 'Enter details for the restriction',
    })

    WHEN('I submit a restriction that is more than 100 characters long')
    addRestrictionsPage.completeForm(faker.word.words(20))

    THEN('I should see an error')
    addRestrictionsPage.shouldShowErrorMessagesForFields(['description'], {
      description: 'The restriction must be 100 characters or less',
    })

    WHEN('I submit a valid restriction')
    cy.task('stubPremisesLocalRestrictionCreate', { premisesId: premises.id })
    const newRestriction = cas1PremisesNewLocalRestrictionFactory.build()
    const restriction = cas1PremisesLocalRestrictionSummaryFactory.build({
      description: newRestriction.description,
    })
    const premisesWithRestriction = { ...premises, localRestrictions: [restriction] }
    cy.task('stubSinglePremises', premisesWithRestriction)
    addRestrictionsPage.completeForm(newRestriction.description)

    THEN('the new restriction should have been saved')
    cy.task('verifyApiPost', apiPaths.premises.localRestrictions.create({ premisesId: premises.id })).then(
      ({ description }) => {
        expect(description).equal(newRestriction.description)
      },
    )

    THEN('I should see a confirmation the restriction has been added')
    Page.verifyOnPage(LocalRestrictionsPage, premises)
    restrictionsPage.shouldShowBanner('The restriction has been added.')

    AND('I should see the list of restrictions')
    restrictionsPage.shouldShowRestrictions(premisesWithRestriction)

    WHEN('I click on Remove next to a restriction')
    restrictionsPage.clickLink(/^Remove/)

    THEN('I should see a confirmation page')
    const confirmRemoveRestrictionPage = Page.verifyOnPage(LocalRestrictionConfirmRemovePage, premises)

    AND('I should see the details of the restriction I want to delete')
    confirmRemoveRestrictionPage.shouldShowInsetText(restriction.description)

    WHEN('I click confirm to remove the restriction')
    cy.task('stubPremisesLocalRestrictionDelete', { premisesId: premises.id, restrictionId: restriction.id })
    cy.task('stubSinglePremises', premises)
    confirmRemoveRestrictionPage.clickButton('Confirm')

    THEN('the restriction should have been removed')
    cy.task(
      'verifyApiDelete',
      apiPaths.premises.localRestrictions.delete({
        premisesId: premises.id,
        restrictionId: restriction.id,
      }),
    )

    THEN('I should see a confirmation the restriction has been removed')
    restrictionsPage.shouldShowBanner('The restriction has been removed.')

    AND('I should see no local restrictions for the premises')
    restrictionsPage.shouldShowNoRestrictions()
  })
})
