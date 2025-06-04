import { addDays, addMonths, subDays } from 'date-fns'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import {
  activeOffenceFactory,
  applicationFactory,
  personFactory,
  restrictedPersonFactory,
  risksFactory,
  tierEnvelopeFactory,
  userFactory,
} from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import * as ApplyPages from '../../pages/apply'
import { ConfirmDetailsPage, ConfirmYourDetailsPage, EnterCRNPage, ListPage, StartPage } from '../../pages/apply'
import IsExceptionalCasePage from '../../pages/apply/isExceptionalCase'
import NoOffencePage from '../../pages/apply/noOffence'
import NotEligiblePage from '../../pages/apply/notEligiblePage'
import Page from '../../pages/page'
import SubmissionConfirmation from '../../pages/apply/submissionConfirmation'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'

context('Apply', () => {
  beforeEach(setup)

  it('allows completion of the form', function test() {
    // And I complete the application
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeApplication()

    // Then the application should be submitted to the API
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(apply.numberOfPages())
      const body = JSON.parse(requests[requests.length - 1].body)

      expect(body).to.have.keys(
        'data',
        'arrivalDate',
        'apType',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'isInapplicable',
        'isEmergencyApplication',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
      expect(body.data).to.deep.equal(this.applicationData)
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/applications/${this.application.id}/submission`)

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys(
        'arrivalDate',
        'translatedDocument',
        'apType',
        'isEmergencyApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
    })

    // And I should be taken to the confirmation page
    const confirmationPage = new SubmissionConfirmation()

    // Given there are applications in the database
    const applications = applicationFactory.withReleaseDate().buildList(5)
    cy.task('stubApplications', applications)

    // And there are risks in the database
    const risks = risksFactory.buildList(5)
    applications.forEach((stubbedApplication, i) => {
      cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
    })

    // When I click 'Back to dashboard'
    confirmationPage.clickBackToDashboard()

    // Then I am taken back to the dashboard
    Page.verifyOnPage(ListPage)
  })

  it('If users navigates away from application when told tier not eligible, return to is exceptional case page', function test() {
    // Given the person does not have an eligible risk tier
    this.application.risks = risksFactory.build({
      crn: this.person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: 'D1' } }),
    })
    cy.task('stubApplicationGet', { application: this.application })
    cy.task('stubApplications', [this.application])

    // And I start the application and left
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // And I visit the list page
    const listPage = ListPage.visit([this.application], [], [])

    // When I click the application from list
    listPage.clickApplication(this.application)

    // And I click the basic information
    apply.clickBasicInformation()

    // Then I should see the is exceptional case page
    Page.verifyOnPage(ApplyPages.IsExceptionalCasePage, this.application)
  })

  it('throws an error if the the CRN entered is an LAO', function test() {
    const lao = restrictedPersonFactory.build()
    cy.task('stubFindPerson', { person: lao })

    // Given I visit the start page
    const startPage = StartPage.visit()
    startPage.startApplication()

    // And I enter a CRN that is restricted
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(lao.crn)
    crnPage.clickSubmit()

    // Then I should see an error message telling me the CRN is restricted
    crnPage.shouldShowRestrictedCrnMessage(lao)
  })

  it('shows additional guidance if the person is restricted', function test() {
    const restrictedPerson = personFactory.build({ isRestricted: true })
    cy.task('stubFindPerson', { person: restrictedPerson })
    cy.task('stubPersonOffences', { person: restrictedPerson, offences: activeOffenceFactory.buildList(1) })

    // Given I visit the start page
    const startPage = StartPage.visit()
    startPage.startApplication()

    // And I enter a CRN that is restricted
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(restrictedPerson.crn)
    crnPage.clickSubmit()

    // Then I should see LAO messaging on the confirmation page
    const confirmDetailsPage = new ConfirmDetailsPage(restrictedPerson)
    confirmDetailsPage.verifyRestrictedPersonMessaging()
  })

  it('creates an application with the correct index offence when there are multiple offences present', function test() {
    // Given the person has more than one offence listed under their CRN
    const offences = activeOffenceFactory.buildList(4)

    const apply = new ApplyHelper(this.application, this.person, offences)
    apply.setupApplicationStubs()

    // Then I should be able to select an offence
    apply.startApplication(offences[2])

    // Then I should be on the Confirm Your Details page
    Page.verifyOnPage(ConfirmYourDetailsPage, this.application)
  })

  it(`allows the user to specify if the risk level if the person does not have a tier`, function test() {
    // And that person does not have an eligible risk tier
    const risks = risksFactory.build({
      tier: undefined,
    })

    this.application.risks = risks

    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // Then I should be able to confirm that the case is exceptional
    apply.completeMissingTierSection()
  })

  it(`allows the user to specify if the case is exceptional if the offender's tier is not eligible`, function test() {
    // Given the person does not have an eligible risk tier
    const risks = risksFactory.build({
      crn: this.person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: 'D1' } }),
    })
    this.application.risks = risks

    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // Then I should be able to confirm that the case is exceptional
    apply.completeExceptionalCase()

    // And I should be on the Confirm Your Details page
    Page.verifyOnPage(ConfirmYourDetailsPage, this.application)
  })

  it('tells the user that their application is not applicable if the tier is not eligible and it is not an exceptional case', function test() {
    // Given the person does not have an eligible risk tier
    const risks = risksFactory.build({
      crn: this.person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: 'D1' } }),
    })
    this.application.risks = risks

    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // Then I should be prompted to confirm that the case is exceptional
    const isExceptionalCasePage = Page.verifyOnPage(IsExceptionalCasePage)

    // And I select no
    isExceptionalCasePage.completeForm('no')
    isExceptionalCasePage.clickSubmit()

    // Then I should be told the application is not eligible
    Page.verifyOnPage(NotEligiblePage)
  })

  it('allows completion of application emergency flow', function test() {
    // Given I need to complete I need a placement
    const user = userFactory.build()
    this.application.createdByUserId = user.id
    this.application.submittedAt = undefined
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences, user)
    const tomorrow = addDays(new Date(), 1)

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'release-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(tomorrow, 'releaseDate'),
        releaseDate: DateFormats.dateObjToIsoDate(tomorrow),
        knowReleaseDate: 'yes',
      },
    })

    this.application = addResponseToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'reason-for-short-notice',
      key: 'reason',
      value: 'riskEscalated',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      task: 'further-considerations',
      page: 'trigger-plan',
      keyValuePairs: {
        planInPlace: 'yes',
        additionalConditions: 'yes',
        additionalConditionsDetail: 'some details',
      },
    })
    // When I start the application
    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()

    // Then I am able to complete the Emergency application flow
    apply.completeEmergencyApplication()
  })

  it('supports offenders already in the community', function test() {
    const person = personFactory.build({ status: 'InCommunity' })

    // A 'regular' placement date (not emergency or short notice)
    const placementDate = addMonths(new Date(), 7)
    // A release date in the past
    const releaseDate = subDays(new Date(), 1)
    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'placement-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(placementDate, 'startDate'),
        startDate: DateFormats.dateObjToIsoDate(placementDate),
        startDateSameAsReleaseDate: 'no',
      },
    })
    this.application = addResponsesToFormArtifact(this.application, {
      task: 'basic-information',
      page: 'release-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(releaseDate, 'releaseDate'),
        releaseDate: DateFormats.dateObjToIsoDate(releaseDate),
      },
    })

    this.applicationData = this.application.data

    this.application.person = person

    // And I complete the application
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, person, this.offences)

    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeApplication({ isExceptionalCase: false, isInComunity: true })

    // Then the application should be submitted to the API
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(apply.numberOfPages())
      const body = JSON.parse(requests[requests.length - 1].body)

      expect(body).to.have.keys(
        'arrivalDate',
        'data',
        'apType',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'isInapplicable',
        'isEmergencyApplication',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )

      expect(body.data).to.deep.equal(this.applicationData)
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/applications/${this.application.id}/submission`)

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys(
        'arrivalDate',
        'translatedDocument',
        'apType',
        'isEmergencyApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
    })
  })

  it('redirects to no offence page if there are no offence', function test() {
    // Given a person has no offences
    const offences = activeOffenceFactory.buildList(0)

    // When I enter their CRN
    const apply = new ApplyHelper(this.application, this.person, offences)
    apply.setupApplicationStubs()
    apply.enterCrnDetails()

    // Then I should see a screen telling me they have no offences
    const noOffencePage = Page.verifyOnPage(NoOffencePage)
    noOffencePage.shouldShowParagraphText('an Approved Premises application')
    noOffencePage.confirmLinkText('dashboard')
  })

  it('shows the user a message if there are no documents imported from Delius', function test() {
    // Given I complete the documents selection of application
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    apply.setupApplicationStubs(uiRisks)

    // And no documents uploaded to the application
    apply.stubDocumentEndpoints([])
    apply.startApplication()
    apply.completeApplication({ isNoDocuments: true })

    // Then should display No documents have been imported from Delius message will be displayed
    apply.verifyNoDocumentsDisplayed()
  })
})
