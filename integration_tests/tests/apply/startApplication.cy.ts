import { FullPerson } from '@approved-premises/api'
import {
  activeOffenceFactory,
  personFactory,
  restrictedPersonFactory,
  risksFactory,
  tierDtoFactory,
  tierEnvelopeFactory,
} from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import * as ApplyPages from '../../pages/apply'
import { ConfirmDetailsPage, ConfirmYourDetailsPage, EnterCRNPage, ListPage, StartPage } from '../../pages/apply'
import IsExceptionalCasePage from '../../pages/apply/isExceptionalCase'
import NoOffencePage from '../../pages/apply/noOffence'
import NotEligiblePage from '../../pages/apply/notEligiblePage'
import Page from '../../pages/page'
import { setup } from './setup'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Apply', () => {
  beforeEach(setup)

  it('If users navigates away from application when told tier not eligible, return to is exceptional case page', function test() {
    GIVEN('the person does not have an eligible risk tier')
    this.application.risks = risksFactory.build({
      crn: this.person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: 'D1' } }),
    })
    const tier = tierDtoFactory.v2Ineligible().build()
    this.person.sex = 'Male'
    this.person.tier = tier
    const application = { ...this.application, person: { ...this.person, tier } }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    AND('I start the application and left')
    const apply = new ApplyHelper(application, application.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    AND('I visit the list page')
    const listPage = ListPage.visit([application], [], [])

    WHEN('I click the application from list')
    listPage.clickApplication(application)

    AND('I click the basic information')
    apply.clickBasicInformation()

    THEN('I should see the is exceptional case page')
    Page.verifyOnPage(ApplyPages.IsExceptionalCasePage, application)
  })

  it('If user navigates away from application on confirm details page for eligible CRN, return to confirm details page', function test() {
    GIVEN('the person has an eligible risk tier')

    const tier = tierDtoFactory.v2Eligible().build()
    this.application.risks = risksFactory.build({
      crn: this.person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: tier.tierScore } }),
    })
    this.person.sex = 'Male'
    this.person.tier = tier
    const application = { ...this.application, person: { ...this.person, tier } }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    AND('I start the application and left')
    const apply = new ApplyHelper(application, application.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    AND('I visit the list page')
    const listPage = ListPage.visit([application], [], [])

    WHEN('I click the application from list')
    listPage.clickApplication(application)

    AND('I click the basic information')
    apply.clickBasicInformation()

    THEN('I should see the is exceptional case page')
    Page.verifyOnPage(ApplyPages.ConfirmYourDetailsPage, this.application)
  })

  it('throws an error if the the CRN entered is an LAO', function test() {
    const lao = restrictedPersonFactory.build()
    cy.task('stubFindPerson', { person: lao })

    GIVEN('I visit the start page')
    const startPage = StartPage.visit()
    startPage.startApplication()

    AND('I enter a CRN that is restricted')
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(lao.crn)
    crnPage.clickSubmit()

    THEN('I should see an error message telling me the CRN is restricted')
    crnPage.shouldShowRestrictedCrnMessage(lao)
  })

  it('shows additional guidance if the person is restricted', function test() {
    const restrictedPerson = personFactory.build({ isRestricted: true })
    cy.task('stubFindPerson', { person: restrictedPerson })
    cy.task('stubPersonOffences', { person: restrictedPerson, offences: activeOffenceFactory.buildList(1) })

    GIVEN('I visit the start page')
    const startPage = StartPage.visit()
    startPage.startApplication()

    AND('I enter a CRN that is restricted')
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(restrictedPerson.crn)
    crnPage.clickSubmit()

    THEN('I should see LAO messaging on the confirmation page')
    const confirmDetailsPage = new ConfirmDetailsPage(restrictedPerson)
    confirmDetailsPage.verifyRestrictedPersonMessaging()
  })

  it('creates an application with the correct index offence when there are multiple offences present', function test() {
    GIVEN('the person has more than one offence listed under their CRN')
    const offences = activeOffenceFactory.buildList(4)

    const apply = new ApplyHelper(this.application, this.person, offences)
    apply.setupApplicationStubs()

    THEN('I should be able to select an offence')
    apply.startApplication({ selectedOffence: offences[2] })

    THEN('I should be on the Confirm Your Details page')
    Page.verifyOnPage(ConfirmYourDetailsPage, this.application)
  })

  it(`allows the user to specify if the case is exceptional if the offender's tier is not eligible`, function test() {
    GIVEN('the person does not have an eligible risk tier')
    const tier = tierDtoFactory.v2Ineligible().build()
    this.person.sex = 'Male'
    this.person.tier = tier
    const application = { ...this.application, person: { ...this.person, tier } }

    const apply = new ApplyHelper(application, application.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    THEN('I should be able to confirm that the case is exceptional')
    apply.completeExceptionalCase()

    AND('I should be on the Confirm Your Details page')
    Page.verifyOnPage(ConfirmYourDetailsPage, application)
  })

  it('tells the user that their application is not applicable if the V2 tier is not eligible and it is not an exceptional case', function test() {
    GIVEN('the person does not have an eligible risk tier')
    const tier = tierDtoFactory.v2Ineligible().build()
    this.person.sex = 'Male'
    this.person.tier = tier
    const application = { ...this.application, person: { ...this.person, tier } }

    cy.task('stubApplicationGet', { application })
    const apply = new ApplyHelper(application, application.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    THEN('I should be prompted to confirm that the case is exceptional')
    const isExceptionalCasePage = Page.verifyOnPage(IsExceptionalCasePage, application)

    AND('I select no')
    isExceptionalCasePage.completeForm('no')
    isExceptionalCasePage.clickSubmit()

    THEN('I should be told the application is not eligible')
    Page.verifyOnPage(NotEligiblePage, application)
  })

  it('tells the user that their application is not applicable if the V3 tier is not eligible and it is not an exceptional case', function test() {
    GIVEN('the person does not have an eligible risk tier')
    const tier = tierDtoFactory.v3Ineligible().build()
    this.person.sex = 'Male'
    this.person.tier = tier
    const application = { ...this.application, person: { ...this.person, tier } }

    cy.task('stubApplicationGet', { application })
    const apply = new ApplyHelper(application, application.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication({ withCas2Interstitial: true })

    THEN('I should be prompted to confirm that the case is exceptional')
    const isExceptionalCasePage = Page.verifyOnPage(IsExceptionalCasePage, application)

    AND('I select no')
    isExceptionalCasePage.completeForm('no')
    isExceptionalCasePage.clickSubmit()

    THEN('I should be told the application is not eligible')
    Page.verifyOnPage(NotEligiblePage, application)
  })

  it('redirects to no offence page if there are no offences', function test() {
    GIVEN('a person has no offences')
    const offences = activeOffenceFactory.buildList(0)

    WHEN('I enter their CRN')
    const apply = new ApplyHelper(this.application, this.person, offences)
    apply.setupApplicationStubs()
    apply.enterCrnDetails()

    THEN('I should see a screen telling me they have no offences')
    const noOffencePage = Page.verifyOnPage(NoOffencePage)
    noOffencePage.shouldShowParagraphText('an Approved Premises application')
    noOffencePage.confirmLinkText('dashboard')
  })

  it('allows the user to proceed if they are a female with Tier D without confirming exceptional case', function test() {
    const tier = tierDtoFactory.build({ version: 'V3', tierScore: 'D' })
    this.person.tier = tier
    this.person.sex = 'Female'
    const apply = new ApplyHelper({ ...this.application, person: this.person }, this.person, this.offences)
    const application = { ...this.application, person: { ...this.person, tier } }
    apply.setupApplicationStubs()
    apply.startApplication({ withCas2Interstitial: true })

    THEN('I am on the Confirm your details page')
    Page.verifyOnPage(ApplyPages.ConfirmYourDetailsPage, application)
  })

  it('allows the user to specify if the case is exceptional for a male with a V3 tier D', function test() {
    const tier = tierDtoFactory.build({ version: 'V3', tierScore: 'D' })
    this.person.tier = tier
    this.person.sex = 'Male'
    const application = { ...this.application, person: { ...this.person, tier } }

    const apply = new ApplyHelper({ ...this.application, person: this.person }, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication({ withCas2Interstitial: true })

    THEN('I should be asked whether the application is an exceptional case')
    Page.verifyOnPage(ApplyPages.IsExceptionalCasePage, application)
    apply.completeExceptionalCase()

    AND('I should be on the Confirm Your Details page')
    Page.verifyOnPage(ApplyPages.ConfirmYourDetailsPage, application)
  })

  it('Follows the Tier V3 CAS2 interstitial page route', function test() {
    this.person.tier = tierDtoFactory.build({ version: 'V3', tierScore: 'B' })
    const apply = new ApplyHelper({ ...this.application, person: this.person }, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication({ withCas2Interstitial: true })

    THEN('I am on the Confirm your details page')
    Page.verifyOnPage(ApplyPages.ConfirmYourDetailsPage, this.application)
  })

  it('Stops the application if V3 tier is MISSING', function test() {
    this.person.tier = tierDtoFactory.build({ version: 'V3', tierScore: 'MISSING' })
    const apply = new ApplyHelper({ ...this.application, person: this.person }, this.person, this.offences)
    apply.setupApplicationStubs()

    WHEN('I start an application and confirm the person')
    apply.enterCrnDetails()
    Page.verifyOnPage(ApplyPages.ConfirmDetailsPage, this.person as FullPerson).clickSaveAndContinue()

    THEN('I am on the stop page')
    const eligibilityCheckPage = Page.verifyOnPage(ApplyPages.EligibilityCheckPage, this.person as FullPerson)
    eligibilityCheckPage.checkDashboardLink()
  })
})
