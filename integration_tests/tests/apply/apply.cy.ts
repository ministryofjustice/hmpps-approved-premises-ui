import { addDays } from 'date-fns'
import { EnterCRNPage, ListPage, SelectOffencePage, ShowPage, StartPage, TransgenderPage } from '../../pages/apply'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import {
  activeOffenceFactory,
  applicationFactory,
  personFactory,
  risksFactory,
  tierEnvelopeFactory,
} from '../../../server/testutils/factories'

import ApplyHelper from '../../helpers/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import IsExceptionalCasePage from '../../pages/apply/isExceptionalCase'
import NotEligiblePage from '../../pages/apply/notEligiblePage'
import Page from '../../pages/page'
import SubmissionConfirmation from '../../pages/apply/submissionConfirmation'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { updateApplicationReleaseDate } from '../../helpers'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  beforeEach(() => {
    // Given I am logged in
    cy.signIn()

    cy.fixture('applicationData.json').then(applicationData => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, status: 'inProgress' })
      const risks = risksFactory.build({
        crn: person.crn,
        tier: tierEnvelopeFactory.build({ value: { level: 'A3' } }),
      })
      const offences = activeOffenceFactory.buildList(1)
      application.data = updateApplicationReleaseDate(applicationData)
      application.risks = risks

      cy.wrap(person).as('person')
      cy.wrap(offences).as('offences')
      cy.wrap(application).as('application')
      cy.wrap(application.data).as('applicationData')
    })
  })

  it('allows the user to select an index offence if there is more than one offence', function test() {
    // And that person has more than one offence listed under their CRN
    const offences = activeOffenceFactory.buildList(4)

    const apply = new ApplyHelper(this.application, this.person, offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // Then I should be forwarded to select an offence
    const selectOffencePage = Page.verifyOnPage(SelectOffencePage, this.person, offences)
    selectOffencePage.shouldDisplayOffences()

    // When I select an offence
    const selectedOffence = offences[0]
    selectOffencePage.selectOffence(selectedOffence)

    // And I click submit
    selectOffencePage.clickSubmit()

    // Then the API should have created the application with my selected offence
    cy.task('verifyApplicationCreate').then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body.crn).equal(this.person.crn)
      expect(body.convictionId).equal(selectedOffence.convictionId)
      expect(body.deliusEventNumber).equal(selectedOffence.deliusEventNumber)
      expect(body.offenceId).equal(selectedOffence.offenceId)
    })

    // Then I should be on the Sentence Type page
    Page.verifyOnPage(TransgenderPage, this.application)
  })

  it(`allows the user to specify if the case is exceptional if the offender's tier is not eligible`, function test() {
    // And that person does not have an eligible risk tier
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

    // And I should be on the Sentence Type page
    Page.verifyOnPage(TransgenderPage, this.application)
  })

  it('tells the user that their application is not applicable if the tier is not eligible and it is not an exceptional case', function test() {
    // And that person does not have an eligible risk tier
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

  it("creates and updates an application given a person's CRN", function test() {
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    // Then the API should have created the application
    cy.task('verifyApplicationCreate').then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)
      const offence = this.offences[0]

      expect(body.crn).equal(this.person.crn)
      expect(body.convictionId).equal(offence.convictionId)
      expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
      expect(body.offenceId).equal(offence.offenceId)
    })

    // And I complete the basic information step
    apply.completeBasicInformation()

    // Then the API should have recieved the updated application
    cy.task('verifyApplicationUpdate', this.application.id).then(requests => {
      const firstRequestData = JSON.parse(requests[0].body).data
      const secondRequestData = JSON.parse(requests[1].body).data

      expect(firstRequestData['basic-information'].transgender.transgenderOrHasTransgenderHistory).equal('yes')
      expect(secondRequestData['basic-information']['complex-case-board'].reviewRequired).equal('yes')
    })
  })

  it('shows an error message if the person is not found', function test() {
    // And the person I am about to search for is not in Delius
    const person = personFactory.build()
    cy.task('stubPersonNotFound', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    crnPage.shouldShowPersonNotFoundErrorMessage(person)
  })

  it('shows an error message if the person is not in the users caseload', function test() {
    // And the person I am about to search for is not in my caseload
    cy.task('stubFindPersonNotInCaseload', { person: this.person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(this.person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    new EnterCRNPage().shouldShowPersonNotInCaseLoadErrorMessage(this.person)
  })

  it('shows an error message if the person does not have a NOMS number', function test() {
    // And the person I am about to search does not have NOMS number
    cy.task('stubFindPersonNoNomsNumber', this.person.crn)

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(this.person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    new EnterCRNPage().shouldShowNoNomsRecordForPersonErrorMessage(this.person)
  })

  it('shows an error message if the person does not have a OASYS record', function test() {
    // And the person I am about to search for does not have an OASYS record
    cy.task('stubFindPersonNoOasysRecord', this.person.crn)

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(this.person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    new EnterCRNPage().shouldShowNoOasysForPersonErrorMessage(this.person)
  })

  it('allows completion of application emergency flow', function test() {
    // And I complete the application
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    const tomorrow = addDays(new Date(), 1)

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'basic-information',
      page: 'release-date',
      keyValuePairs: {
        ...DateFormats.dateObjectToDateInputs(tomorrow, 'releaseDate'),
        releaseDate: DateFormats.dateObjToIsoDate(tomorrow),
        knowReleaseDate: 'yes',
      },
    })

    this.application = addResponseToFormArtifact(this.application, {
      section: 'basic-information',
      page: 'reason-for-short-notice',
      key: 'reason',
      value: 'riskEscalated',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'further-considerations',
      page: 'trigger-plan',
      keyValuePairs: {
        planInPlace: 'yes',
        additionalConditions: 'yes',
        additionalConditionsDetail: 'some details',
      },
    })

    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeEmergencyApplication()
  })

  it('allows completion of the ESAP flow', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: 'esap',
    })

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'managed-by-national-security-division',
      key: 'managedByNationalSecurityDivision',
      value: 'no',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'esap-exceptional-case',
      keyValuePairs: {
        ...DateFormats.isoDateToDateInputs('2023-07-01', 'agreementDate'),
        agreedCaseWithCommunityHopp: 'yes',
        communityHoppName: 'Some Manager',
        agreementSummary: 'Some Summary Text',
      },
    })

    apply.setupApplicationStubs(uiRisks)

    // And I start the application
    apply.startApplication()
    apply.completeBasicInformation()

    // And I complete the Esap flow
    apply.completeEsapFlow()

    // Then I should be asked if the person is managed by the National Security division
  })

  it('Tells me I am ineligible for ESAP', function test() {
    // Given I have completed the basic information of a form
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'ap-type',
      key: 'type',
      value: 'esap',
    })

    this.application = addResponseToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'managed-by-national-security-division',
      key: 'managedByNationalSecurityDivision',
      value: 'no',
    })

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'type-of-ap',
      page: 'esap-exceptional-case',
      keyValuePairs: {
        agreedCaseWithCommunityHopp: 'no',
      },
    })

    apply.setupApplicationStubs(uiRisks)

    // And I start the application
    apply.startApplication()
    apply.completeBasicInformation()

    // And I complete the Esap flow
    apply.completeIneligibleEsapFlow()

    // Then I should be told I am ineligible for an ESAP placement
  })

  it('handles missing Oasys information', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    const oasysMissing = true

    apply.setupApplicationStubs(uiRisks, oasysMissing)
    apply.startApplication()
    apply.completeBasicInformation({ isEmergencyApplication: false })
    apply.completeTypeOfApSection()
    apply.completeOasysSection(oasysMissing)
  })

  it('handles missing Nomis information', function test() {
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)

    this.application = addResponsesToFormArtifact(this.application, {
      section: 'prison-information',
      page: 'case-notes',
      keyValuePairs: {
        informationFromPrison: 'yes',
        informationFromPrisonDetail: 'Some Detail',
        additionalConditionsDetail: 'some details',
      },
    })

    const apply = new ApplyHelper(this.application, this.person, this.offences)
    const nomisMissing = true

    apply.setupApplicationStubs(uiRisks, false, nomisMissing)
    apply.startApplication()
    apply.completeBasicInformation({ isEmergencyApplication: false })
    apply.completeTypeOfApSection()
    apply.completeOasysSection()
    apply.completeRiskManagementSection()
    apply.completePrisonInformationSection(nomisMissing)
  })

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
        'isPipeApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'type',
        'isInapplicable',
        'isEsapApplication',
        'isEmergencyApplication',
      )
      expect(body.data).to.deep.equal(this.applicationData)

      cy.task('validateBodyAgainstApplySchema', body.data).then(result => {
        expect(result).to.equal(true)
      })
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/applications/${this.application.id}/submission`)

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys(
        'arrivalDate',
        'translatedDocument',
        'isPipeApplication',
        'isEsapApplication',
        'isEmergencyApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'type',
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

  it('shows a read-only version the application', function test() {
    // Given I have completed an application
    const updatedApplication = { ...this.application, status: 'submitted' }
    cy.task('stubApplicationGet', { application: updatedApplication })
    cy.task('stubApplications', [updatedApplication])

    // And I visit the list page
    const listPage = ListPage.visit([], [updatedApplication], [])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowInProgressApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, updatedApplication)

    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()
  })
})
