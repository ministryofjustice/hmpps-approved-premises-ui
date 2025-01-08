import {
  ActiveOffence,
  Adjudication,
  ApprovedPremisesApplication as Application,
  Document,
  FullPerson,
  OASysQuestion,
  OASysSection,
  OASysSupportingInformationQuestion,
  Person,
  PersonAcctAlert,
  PrisonCaseNote,
  ApprovedPremisesUser as User,
} from '@approved-premises/api'
import { ContingencyPlanQuestionsBody, PartnerAgencyDetails, PersonRisksUI } from '@approved-premises/ui'

import * as ApplyPages from '../pages/apply'
import {
  offenceDetailSummariesFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  roshSummariesFromApplication,
  supportInformationFromApplication,
} from './index'

import ApplyPage from '../pages/apply/applyPage'
import Page from '../pages'
import {
  acctAlertFactory,
  adjudicationFactory,
  cas1PremisesBasicSummaryFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  documentFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  premisesSummaryFactory,
  prisonCaseNotesFactory,
  userFactory,
} from '../../server/testutils/factories'
import { documentsFromApplication } from '../../server/utils/assessments/documentUtils'
import oasysStubs from '../../server/data/stubs/oasysStubs.json'

export default class ApplyHelper {
  pages = {
    basicInformation: [] as Array<ApplyPage>,
    typeOfAp: [] as Array<ApplyPage>,
    oasys: [] as Array<ApplyPage>,
    riskManagement: [] as Array<ApplyPage>,
    locationFactors: [] as Array<ApplyPage>,
    accessAndHealthcare: [] as Array<ApplyPage>,
    furtherConsiderations: [] as Array<ApplyPage>,
    contingencyPlanPartners: [] as Array<ApplyPage>,
    moveOn: [] as Array<ApplyPage>,
  }

  uiRisks?: PersonRisksUI

  oasysSectionsLinkedToReoffending: Array<OASysSection> = []

  otherOasysSections: Array<OASysSection> = []

  roshSummaries: Array<OASysQuestion> = []

  offenceDetailSummaries: Array<OASysQuestion> = []

  supportingInformationSummaries: Array<OASysSupportingInformationQuestion> = []

  riskManagementPlanSummaries: Array<OASysQuestion> = []

  riskToSelfSummaries: Array<OASysQuestion> = []

  selectedPrisonCaseNotes: Array<PrisonCaseNote> = []

  adjudications: Array<Adjudication> = []

  acctAlerts: Array<PersonAcctAlert> = []

  documents: Array<Document> = []

  selectedDocuments: Array<Document> = []

  contingencyPlanPartners: Array<PartnerAgencyDetails> = []

  contingencyPlanQuestions: ContingencyPlanQuestionsBody

  constructor(
    private readonly application: Application,
    private readonly person: Person,
    private readonly offences: Array<ActiveOffence>,
    private readonly user: User = userFactory.build(),
  ) {}

  setupApplicationStubs(uiRisks?: PersonRisksUI, oasysMissing = false, nomisMissing = false) {
    this.uiRisks = uiRisks
    this.stubPersonEndpoints()
    this.stubApplicationEndpoints()
    this.stubPremisesEndpoint()
    this.stubCas1PremisesEndpoint()
    if (oasysMissing) {
      this.stubOasys404()
    } else {
      this.stubOasysEndpoints()
    }

    if (nomisMissing) {
      this.stubPrisonCaseNotes404()
    } else {
      this.stubPrisonCaseNoteEndpoints()
      this.stubAdjudicationEndpoints()
      this.stubAcctAlertsEndpoint()
    }
    this.stubDocumentEndpoints()
    this.stubOffences()
    this.stubUserEndpoint()
    this.addContingencyPlanDetails()
    this.stubApAreasEndpoint()
  }

  enterCrnDetails() {
    // Given I visit the start page
    const startPage = ApplyPages.StartPage.visit()
    startPage.startApplication()

    // And I complete the first step
    const crnPage = new ApplyPages.EnterCRNPage()
    crnPage.enterCrn(this.person.crn)
    crnPage.clickSubmit()
  }

  startApplication(selectedOffence: ActiveOffence = this.offences[0]) {
    this.enterCrnDetails()

    // And I see the person on the confirmation page
    const confirmDetailsPage = new ApplyPages.ConfirmDetailsPage(this.person as FullPerson)
    confirmDetailsPage.shouldShowPersonDetails(this.person as FullPerson)

    // And I confirm the person is who I expect to see
    confirmDetailsPage.clickSaveAndContinue()

    // Then I should be forwarded to select an offence
    const selectOffencePage = Page.verifyOnPage(ApplyPages.SelectOffencePage, this.person, this.offences)
    selectOffencePage.shouldDisplayOffences()

    // When I select an offence
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
  }

  completeApplication({ isExceptionalCase = false, isInComunity = false, isNoDocuments = false } = {}) {
    if (isExceptionalCase) {
      this.completeExceptionalCase()
    }
    this.completeBasicInformation({ isEmergencyApplication: false, isInComunity })
    this.completeTypeOfApSection()
    this.completeOasysSection()
    this.completeRiskManagementSection()
    this.completePrisonInformationSection()
    this.completeAccessAndHealthcareSection()
    this.completeFurtherConsiderationsSection()
    this.completeMoveOnSection()
    if (!isNoDocuments) {
      this.completeDocumentsSection()
      this.completeCheckYourAnswersSection()
      this.submitApplication()
    }
  }

  completeEmergencyApplication() {
    this.completeBasicInformation({ isEmergencyApplication: true })
    this.completeTypeOfApSection()
    this.completeOasysSection()
    this.completeRiskManagementSection()
    this.completePrisonInformationSection()
    this.completeAccessAndHealthcareSection()
    this.completeFurtherConsiderationsSection()
  }

  numberOfPages() {
    return [
      ...this.pages.basicInformation,
      ...this.pages.typeOfAp,
      ...this.pages.oasys,
      ...this.pages.riskManagement,
      ...this.selectedPrisonCaseNotes,
      ...this.pages.locationFactors,
      ...this.pages.accessAndHealthcare,
      ...this.pages.furtherConsiderations,
      ...this.pages.contingencyPlanPartners,
      ...this.pages.moveOn,
      ...this.selectedDocuments,
    ].length
  }

  private stubPremisesEndpoint() {
    const premises1 = premisesSummaryFactory.build({ id: '1', apArea: 'area1' })
    const premises2 = premisesSummaryFactory.build({ id: '2', apArea: 'area2' })
    const premises3 = premisesSummaryFactory.build({ id: '3', apArea: 'area3' })
    cy.task('stubAllPremises', [premises1, premises2, premises3])
  }

  private stubCas1PremisesEndpoint() {
    const premises1 = cas1PremisesBasicSummaryFactory.build({ id: '1', apArea: { id: '1', name: 'area1' } })
    const premises2 = cas1PremisesBasicSummaryFactory.build({ id: '2', apArea: { id: '2', name: 'area2' } })
    const premises3 = cas1PremisesBasicSummaryFactory.build({ id: '3', apArea: { id: '3', name: 'area3' } })
    cy.task('stubCas1AllPremises', [premises1, premises2, premises3])
  }

  private stubPersonEndpoints() {
    cy.task('stubPersonRisks', { person: this.person, risks: this.application.risks })
    cy.task('stubFindPerson', { person: this.person })
    cy.task('stubFindPersonAndCheckCaseload', { person: this.person })
  }

  private stubOffences() {
    cy.task('stubPersonOffences', { person: this.person, offences: this.offences })
  }

  private stubUserEndpoint() {
    cy.task('stubFindUser', { user: this.user, id: this.application.createdByUserId })
  }

  private stubApplicationEndpoints() {
    // Given I can create an application
    cy.task('stubJourney', this.application)
  }

  private stubOasys404() {
    cy.task('stubOasysSelection404', { person: this.person })
    cy.task('stubOasysSection404', { person: this.person })

    this.roshSummaries = oasysStubs.roshSummary
    this.offenceDetailSummaries = oasysStubs.offenceDetails
    this.supportingInformationSummaries = oasysStubs.supportingInformation
    this.riskManagementPlanSummaries = oasysStubs.riskManagementPlan
    this.riskToSelfSummaries = oasysStubs.riskToSelf
  }

  private stubPrisonCaseNotes404() {
    cy.task('stubPrisonCaseNotes404', { person: this.person })
  }

  private stubOasysEndpoints() {
    // And there are OASys sections in the db
    const oasysSelectionA = oasysSelectionFactory.needsLinkedToReoffending().build({
      section: 1,
      name: 'accommodation',
    })
    const oasysSelectionB = oasysSelectionFactory.needsLinkedToReoffending().build({
      section: 2,
      name: 'relationships',
      linkedToHarm: false,
      linkedToReOffending: true,
    })
    const oasysSelectionC = oasysSelectionFactory.needsNotLinkedToReoffending().build({
      section: 3,
      name: 'emotional',
      linkedToHarm: false,
      linkedToReOffending: false,
    })
    const oasysSelectionD = oasysSelectionFactory.needsNotLinkedToReoffending().build({
      section: 4,
      name: 'excluded',
      linkedToHarm: false,
      linkedToReOffending: false,
    })
    const oasysSelectionE = oasysSelectionFactory.needsNotLinkedToReoffending().build({
      section: 6,
      name: 'included',
      linkedToHarm: false,
      linkedToReOffending: false,
    })

    this.oasysSectionsLinkedToReoffending = [oasysSelectionA, oasysSelectionB]
    this.otherOasysSections = [oasysSelectionC, oasysSelectionD, oasysSelectionE]

    const oasysSelection = [...this.oasysSectionsLinkedToReoffending, ...this.otherOasysSections]

    cy.task('stubOasysSelection', { person: this.person, oasysSelection })

    const oasysSections = oasysSectionsFactory.build()

    this.roshSummaries = roshSummariesFromApplication(this.application)
    this.offenceDetailSummaries = offenceDetailSummariesFromApplication(this.application)
    this.supportingInformationSummaries = supportInformationFromApplication(this.application)
    this.riskManagementPlanSummaries = riskManagementPlanFromApplication(this.application)
    this.riskToSelfSummaries = riskToSelfSummariesFromApplication(this.application)

    cy.task('stubOasysSections', {
      person: this.person,
      oasysSections: {
        ...oasysSections,
        roshSummary: this.roshSummaries,
        offenceDetails: this.offenceDetailSummaries,
        riskManagementPlan: this.riskManagementPlanSummaries,
        riskToSelf: this.riskToSelfSummaries,
      },
    })
    cy.task('stubOasysSectionsWithSelectedSections', {
      person: this.person,
      oasysSections: {
        ...oasysSections,
        roshSummary: this.roshSummaries,
        offenceDetails: this.offenceDetailSummaries,
        supportingInformation: this.supportingInformationSummaries,
      },
      selectedSections: [1, 2, 3, 4],
    })
  }

  private stubPrisonCaseNoteEndpoints() {
    // And there is prison case notes for the person in the DB
    const prisonCaseNote1 = prisonCaseNotesFactory.build({
      authorName: 'Denise Collins',
      id: 'a30173ca-061f-42c9-a1a2-28c70b282d3f',
      createdAt: '2022-11-10',
      occurredAt: '2022-10-19',
      sensitive: false,
      subType: 'Ressettlement',
      type: 'Social Care',
      note: 'Note 1',
    })
    const prisonCaseNote2 = prisonCaseNotesFactory.build({
      authorName: 'Leticia Mann',
      id: '4a477187-b77f-4fcc-a919-43a6633ee868',
      createdAt: '2022-07-24',
      occurredAt: '2022-09-22',
      sensitive: true,
      subType: 'Quality Work',
      type: 'General',
      note: 'Note 2',
    })
    const prisonCaseNote3 = prisonCaseNotesFactory.build()
    const prisonCaseNotes = [prisonCaseNote1, prisonCaseNote2, prisonCaseNote3]

    this.selectedPrisonCaseNotes = [prisonCaseNote1, prisonCaseNote2]

    cy.task('stubPrisonCaseNotes', { prisonCaseNotes, person: this.person })
  }

  private stubAdjudicationEndpoints() {
    const adjudication1 = adjudicationFactory.build({
      id: 69927,
      reportedAt: '2022-10-09',
      establishment: 'Hawthorne',
      offenceDescription: 'Nam vel nisi fugiat veniam possimus omnis.',
      hearingHeld: false,
      finding: 'NOT_PROVED',
    })
    const adjudication2 = adjudicationFactory.build({
      id: 39963,
      reportedAt: '2022-07-10',
      establishment: 'Oklahoma City',
      offenceDescription: 'Illum maxime enim explicabo soluta sequi voluptas.',
      hearingHeld: true,
      finding: 'PROVED',
    })
    const adjudication3 = adjudicationFactory.build({
      id: 77431,
      reportedAt: '2022-05-30',
      establishment: 'Jurupa Valley',
      offenceDescription: 'Quis porro nemo voluptates doloribus atque quis provident iure.',
      hearingHeld: false,
      finding: 'PROVED',
    })

    this.adjudications = [adjudication1, adjudication2, adjudication3]

    cy.task('stubAdjudications', { adjudications: this.adjudications, person: this.person })
  }

  private stubAcctAlertsEndpoint() {
    const acctAlert1 = acctAlertFactory.build({
      alertId: 47419,
      dateCreated: '2022-12-05',
      dateExpires: '2023-05-29',
      comment: 'Soluta harum harum hic maxime reprehenderit quis harum necessitatibus.',
      expired: false,
      active: true,
    })
    const acctAlert2 = acctAlertFactory.build({
      alertId: 429,
      dateCreated: '2022-05-21',
      dateExpires: '2023-12-16',
      comment: 'Quia ex nisi deserunt voluptatibus sit ipsa.',
      expired: false,
      active: true,
    })

    this.acctAlerts = [acctAlert1, acctAlert2]

    cy.task('stubAcctAlerts', { person: this.person, acctAlerts: this.acctAlerts })
  }

  stubDocumentEndpoints(documents?: Array<Document>) {
    // And there are documents in the database
    this.selectedDocuments = documentsFromApplication(this.application)
    this.documents = documents || [this.selectedDocuments, documentFactory.buildList(4)].flat()

    cy.task('stubApplicationDocuments', { application: this.application, documents: this.documents })
    this.documents.forEach(document => {
      cy.task('stubPersonDocument', { person: this.person, document })
    })

    // And the application exists in the database
    cy.task('stubApplicationSubmit', { application: this.application })
  }

  stubApAreasEndpoint() {
    cy.task('stubApAreaReferenceData', {
      apArea: { id: '5e44b880-df20-4751-938f-a14be5fe609d', name: 'Greater Manchester' },
    })
  }

  private addContingencyPlanDetails() {
    this.contingencyPlanPartners = [
      contingencyPlanPartnerFactory.build({
        partnerAgencyName: 'Test agency 1',
        namedContact: 'Test contact 1',
        phoneNumber: '01234567891',
        roleInPlan: 'Test role 1',
      }),
      contingencyPlanPartnerFactory.build({
        partnerAgencyName: 'Test agency 2',
        namedContact: 'Test contact 2',
        phoneNumber: '01234567892',
        roleInPlan: 'Test role 2',
      }),
    ]

    this.contingencyPlanQuestions = contingencyPlanQuestionsBodyFactory.build({
      noReturn: 'Action to be taken',
      placementWithdrawn: 'Further action to be taken',
      victimConsiderations: 'Considerations for victim',
      unsuitableAddresses: 'An unsuitable address',
      suitableAddresses: 'Some suitable addresses',
      breachInformation: 'Breach information to assist decision making',
      otherConsiderations: 'Some other considerations',
    })
  }

  completeMissingTierSection() {
    const enterRiskLevelPage = new ApplyPages.EnterRiskLevel()
    enterRiskLevelPage.completeForm('veryHighRisk')
    enterRiskLevelPage.clickSubmit()

    const isExceptionalCasePage = new ApplyPages.IsExceptionalCasePage()
    isExceptionalCasePage.showsTierNotFoundMessage()
    isExceptionalCasePage.completeForm('yes')
    isExceptionalCasePage.clickSubmit()
  }

  completeExceptionalCase() {
    const isExceptionalCasePage = new ApplyPages.IsExceptionalCasePage()

    isExceptionalCasePage.completeForm('yes')
    isExceptionalCasePage.clickSubmit()

    const exceptionDetailsPage = new ApplyPages.ExceptionDetailsPage()

    exceptionDetailsPage.completeForm()
    exceptionDetailsPage.clickSubmit()
  }

  completeBasicInformation(options: { isEmergencyApplication?: boolean; isInComunity?: boolean } = {}) {
    const confirmYourDetails = new ApplyPages.ConfirmYourDetailsPage(this.application)
    confirmYourDetails.completeForm()
    confirmYourDetails.clickSubmit()

    const caseManagerInformation = new ApplyPages.CaseManagerInformationPage(this.application)
    caseManagerInformation.completeForm()
    caseManagerInformation.clickSubmit()

    const transgenderPage = new ApplyPages.TransgenderPage(this.application)
    transgenderPage.completeForm()
    transgenderPage.clickSubmit()

    const complexCaseBoardPage = new ApplyPages.ComplexCaseBoard(this.application)
    complexCaseBoardPage.completeForm()
    complexCaseBoardPage.clickSubmit()

    const boardTakenPlacePage = new ApplyPages.BoardTakenPlacePage(this.application)
    boardTakenPlacePage.completeForm()
    boardTakenPlacePage.clickSubmit()

    const maleApPage = new ApplyPages.MaleApPage(this.application)
    maleApPage.completeForm()
    maleApPage.clickSubmit()

    const relevantDatesPage = new ApplyPages.RelevantDatesPage(this.application)
    relevantDatesPage.completeForm()
    relevantDatesPage.clickSubmit()

    const sentenceTypePage = new ApplyPages.SentenceTypePage(this.application)
    sentenceTypePage.completeForm()
    sentenceTypePage.clickSubmit()

    const situationPage = new ApplyPages.SituationPage(this.application)
    situationPage.completeForm()
    situationPage.clickSubmit()

    const releaseDatePage = new ApplyPages.ReleaseDatePage(this.application)
    releaseDatePage.completeForm()
    releaseDatePage.clickSubmit()

    const placementStartPage = new ApplyPages.PlacementStartPage(this.application, options.isInComunity)
    placementStartPage.completeForm()
    placementStartPage.clickSubmit()

    if (options?.isEmergencyApplication) {
      const shortNoticePlacementPage = new ApplyPages.ReasonForShortNoticePage(this.application)
      shortNoticePlacementPage.completeForm()
      shortNoticePlacementPage.clickSubmit()
      this.pages.basicInformation.push(shortNoticePlacementPage)
    }

    const placementPurposePage = new ApplyPages.PlacementPurposePage(this.application)
    placementPurposePage.completeForm()
    placementPurposePage.clickSubmit()

    this.pages.basicInformation = [
      confirmYourDetails,
      caseManagerInformation,
      transgenderPage,
      complexCaseBoardPage,
      boardTakenPlacePage,
      maleApPage,
      relevantDatesPage,
      sentenceTypePage,
      releaseDatePage,
      placementStartPage,
      placementPurposePage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Not started')
    tasklistPage.shouldNotShowSubmitComponents()

    // And the risk widgets should be visible
    if (this.uiRisks) {
      tasklistPage.shouldShowRiskWidgets(this.uiRisks)
    }
  }

  completeTypeOfApSection() {
    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(ApplyPages.ApType, this.application)

    // Given I am on the Type of AP Page
    const apTypePage = new ApplyPages.ApType(this.application)

    // When I complete the form and click submit
    apTypePage.completeForm()
    apTypePage.clickSubmit()

    // Given I am on the PIPE referral page
    const pipeDetailsPage = new ApplyPages.PipeReferralPage(this.application)

    // When I complete the form and click submit
    pipeDetailsPage.completeForm()
    pipeDetailsPage.clickSubmit()

    // Given I am on the PIPE OPD screening page
    const pipeOpdScreeningPage = new ApplyPages.PipeOpdScreening(this.application)

    // When I complete the form and click submit
    pipeOpdScreeningPage.completeForm()
    pipeOpdScreeningPage.clickSubmit()

    this.pages.typeOfAp = [apTypePage, pipeDetailsPage, pipeOpdScreeningPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)
    // Then the Type of AP task should show as completed
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Completed')

    // And the OASys import task should show as not started
    tasklistPage.shouldShowTaskStatus('oasys-import', 'Not started')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  completeEsapFlow() {
    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(ApplyPages.ApType, this.application)

    // Given I am on the Type of AP Page
    const typeOfApPage = new ApplyPages.ApType(this.application)

    // When I complete the form and click submit
    typeOfApPage.completeForm()
    typeOfApPage.clickSubmit()

    // Then I should be asked if the person is managed by the national security division
    const isManagedByNationalSecurityDivision = Page.verifyOnPage(ApplyPages.NationalSecurityDivision, this.application)

    // When I answer no to the isManagedByNationalSecurityDivision question
    isManagedByNationalSecurityDivision.completeForm()
    isManagedByNationalSecurityDivision.clickSubmit()

    // Then I should be asked if there has been an agreement with the Community Head of Public Protection
    const exceptionalCase = Page.verifyOnPage(ApplyPages.EsapExceptionalCase, this.application)

    // When I click yes
    exceptionalCase.completeForm()
    exceptionalCase.clickSubmit()

    // Then I should be taken to the rest of the Esap flow
    const esapPlacementScreeningPage = Page.verifyOnPage(ApplyPages.EsapPlacementScreening, this.application)

    // When I complete the screening page
    esapPlacementScreeningPage.completeForm()
    esapPlacementScreeningPage.clickSubmit()

    // Then I should be taken to the Room Searches page
    const roomSearchesPage = Page.verifyOnPage(ApplyPages.EsapRoomSearches, this.application)

    // And I complete the room searches page
    roomSearchesPage.completeForm()
    roomSearchesPage.clickSubmit()

    // Then I should be taken to the CCTV page
    const esapCCTVPage = Page.verifyOnPage(ApplyPages.EsapCCTV, this.application)

    // When I complete the CCTV page
    esapCCTVPage.completeForm()
    esapCCTVPage.clickSubmit()
  }

  completeIneligibleEsapFlow() {
    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(ApplyPages.ApType, this.application)

    // Given I am on the Type of AP Page
    const apTypePage = new ApplyPages.ApType(this.application)

    // When I complete the form and click submit
    apTypePage.completeForm()
    apTypePage.clickSubmit()

    // Then I should be asked if the person is managed by the national security division
    const isManagedByNationalSecurityDivision = Page.verifyOnPage(ApplyPages.NationalSecurityDivision, this.application)

    // When I answer no to the isManagedByNationalSecurityDivision question
    isManagedByNationalSecurityDivision.completeForm()
    isManagedByNationalSecurityDivision.clickSubmit()

    // Then I should be asked if there has been an agreement with the Community Head of Public Protection
    const exceptionalCase = Page.verifyOnPage(ApplyPages.EsapExceptionalCase, this.application)

    // When I choose No
    exceptionalCase.completeForm()
    exceptionalCase.clickSubmit()

    // Then I should be told that my ESAP application is not valid
    const notEligiblePage = Page.verifyOnPage(ApplyPages.EsapNotEligible, this.application)

    // When I click the continue button
    notEligiblePage.clickContinueWithApplication()

    // Then I should be able to choose a different type of AP
    Page.verifyOnPage(ApplyPages.ApType, this.application)
  }

  completeOasysSection(oasysMissing = false) {
    // Given I click the 'Import Oasys' task
    cy.get('[data-cy-task-name="oasys-import"]').click()
    const optionalOasysImportPage = new ApplyPages.OptionalOasysSectionsPage(this.application, oasysMissing)

    // When I complete the form
    if (!oasysMissing) {
      optionalOasysImportPage.completeForm(this.oasysSectionsLinkedToReoffending, this.otherOasysSections)
    }
    optionalOasysImportPage.clickSubmit()

    const roshSummaryPage = new ApplyPages.RoshSummaryPage(this.application, this.roshSummaries, oasysMissing)

    if (this.uiRisks) {
      roshSummaryPage.shouldShowRiskWidgets(this.uiRisks)
    }

    roshSummaryPage.completeForm()

    roshSummaryPage.clickSubmit()

    const offenceDetailsPage = new ApplyPages.OffenceDetailsPage(
      this.application,
      this.offenceDetailSummaries,
      oasysMissing,
    )

    if (this.uiRisks) {
      offenceDetailsPage.shouldShowRiskWidgets(this.uiRisks)
    }

    offenceDetailsPage.completeForm()
    offenceDetailsPage.clickSubmit()

    const supportingInformationPage = new ApplyPages.SupportingInformationPage(
      this.application,
      this.supportingInformationSummaries,
      oasysMissing,
    )
    supportingInformationPage.completeForm()
    supportingInformationPage.clickSubmit()

    const riskManagementPlanPage = new ApplyPages.RiskManagementPlanPage(
      this.application,
      this.riskManagementPlanSummaries,
      oasysMissing,
    )
    riskManagementPlanPage.completeForm()
    riskManagementPlanPage.clickSubmit()

    const riskToSelfPage = new ApplyPages.RiskToSelfPage(this.application, this.riskToSelfSummaries, oasysMissing)
    riskToSelfPage.completeForm()
    riskToSelfPage.clickSubmit()

    this.pages.oasys = [
      optionalOasysImportPage,
      roshSummaryPage,
      offenceDetailsPage,
      supportingInformationPage,
      riskManagementPlanPage,
      riskToSelfPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // Then I should be taken back to the tasklist
    tasklistPage.shouldShowTaskStatus('oasys-import', 'Completed')

    // And the Risk Management Features task should show as not started
    tasklistPage.shouldShowTaskStatus('risk-management-features', 'Not started')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  completeRiskManagementSection() {
    // Given I click the 'Add detail about managing risks and needs' task
    cy.get('[data-cy-task-name="risk-management-features"]').click()

    // When I complete the form
    const riskManagementFeaturesPage = new ApplyPages.RiskManagementFeatures(this.application)
    riskManagementFeaturesPage.completeForm()
    riskManagementFeaturesPage.clickSubmit()

    const convictedOffencesPage = new ApplyPages.ConvictedOffences(this.application)
    convictedOffencesPage.completeForm()
    convictedOffencesPage.clickSubmit()

    const dateOfOffencePage = new ApplyPages.DateOfOffence(this.application)
    dateOfOffencePage.completeForm()
    dateOfOffencePage.clickSubmit()

    const rehabilitativeInterventionsPage = new ApplyPages.RehabilitativeInterventions(this.application)
    rehabilitativeInterventionsPage.completeForm()
    rehabilitativeInterventionsPage.clickSubmit()

    this.pages.riskManagement = [
      riskManagementFeaturesPage,
      convictedOffencesPage,
      dateOfOffencePage,
      rehabilitativeInterventionsPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the risk management task should show a completed status
    tasklistPage.shouldShowTaskStatus('risk-management-features', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  completePrisonInformationSection(nomisMissing = false) {
    // And I click the 'Review prison information' task
    cy.get('[data-cy-task-name="prison-information"]').click()

    const caseNotesPage = new ApplyPages.CaseNotesPage(this.application, this.selectedPrisonCaseNotes)
    if (!nomisMissing) {
      caseNotesPage.shouldDisplayAdjudications(this.adjudications)
      caseNotesPage.shouldDisplayAcctAlerts(this.acctAlerts)
    }
    caseNotesPage.completeForm(nomisMissing)
    caseNotesPage.clickSubmit()

    // Given I click the 'Describe location factors' task
    cy.get('[data-cy-task-name="location-factors"]').click()

    // When I complete the form
    const describeLocationFactorsPage = new ApplyPages.DescribeLocationFactors(this.application)
    describeLocationFactorsPage.completeForm()
    describeLocationFactorsPage.clickSubmit()

    const preferredApsPage = new ApplyPages.PreferredAps(this.application)

    preferredApsPage.completeForm()
    preferredApsPage.clickSubmit()

    this.pages.locationFactors = [describeLocationFactorsPage, preferredApsPage]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the location factors task should show a completed status
    tasklistPage.shouldShowTaskStatus('location-factors', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  private completeAccessAndHealthcareSection() {
    // Given I click the 'Provide access and healthcare information' task
    cy.get('[data-cy-task-name="access-and-healthcare"]').click()

    // When I complete the form
    const accessNeedsPage = new ApplyPages.AccessNeedsPage(this.application)
    accessNeedsPage.completeForm()
    accessNeedsPage.clickSubmit()

    const accessNeedsFurtherQuestionsPage = new ApplyPages.AccessNeedsFurtherQuestionsPage(this.application)
    accessNeedsFurtherQuestionsPage.completeForm()
    accessNeedsFurtherQuestionsPage.clickSubmit()

    const pregnancyPage = new ApplyPages.PregnancyPage(this.application)
    pregnancyPage.completeForm()
    pregnancyPage.clickSubmit()

    const accessNeedsAdditionalDetailsPage = new ApplyPages.AccessNeedsAdditionalDetailsPage(this.application)
    accessNeedsAdditionalDetailsPage.completeForm()
    accessNeedsAdditionalDetailsPage.clickSubmit()

    const covidPage = new ApplyPages.CovidPage(this.application)
    covidPage.completeForm()
    covidPage.clickSubmit()

    this.pages.accessAndHealthcare = [
      accessNeedsPage,
      accessNeedsFurtherQuestionsPage,
      pregnancyPage,
      accessNeedsAdditionalDetailsPage,
      covidPage,
    ]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the access and healthcare task should show a completed status
    tasklistPage.shouldShowTaskStatus('access-and-healthcare', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  private completeFurtherConsiderationsSection() {
    // Given I click the 'Detail further considerations for placement' task
    cy.get('[data-cy-task-name="further-considerations"]').click()

    // And I complete the Room Sharing page
    const roomSharingPage = new ApplyPages.RoomSharingPage(this.application)
    roomSharingPage.completeForm()
    roomSharingPage.clickSubmit()

    // And I complete the Vulnerability page
    const vulnerabilityPage = new ApplyPages.VulnerabilityPage(this.application)
    vulnerabilityPage.completeForm()
    vulnerabilityPage.clickSubmit()

    // And I complete the Previous Placements page
    const previousPlacementsPage = new ApplyPages.PreviousPlacements(this.application)
    previousPlacementsPage.completeForm()
    previousPlacementsPage.clickSubmit()

    // And I complete the Catering page
    const cateringPage = new ApplyPages.CateringPage(this.application)
    cateringPage.completeForm()
    cateringPage.clickSubmit()

    // And I complete the Arson page
    const arsonPage = new ApplyPages.ArsonPage(this.application)
    arsonPage.completeForm()
    arsonPage.clickSubmit()

    // And I complete the Additional Circumstances page
    const additionalCircumstancesPage = new ApplyPages.AdditionalCircumstancesPage(this.application)
    additionalCircumstancesPage.completeForm()
    additionalCircumstancesPage.clickSubmit()

    // And I complete the Contingency Plan Partners page
    const contingencyPlanPartnersPage = new ApplyPages.ContingencyPlanPartnersPage(
      this.application,
      this.contingencyPlanPartners,
    )
    contingencyPlanPartnersPage.completeForm()
    contingencyPlanPartnersPage.clickSubmit()

    this.pages.contingencyPlanPartners = [contingencyPlanPartnersPage]

    // And I complete the Contingency Plan Questions page
    const contingencyPlanQuestionsPage = new ApplyPages.ContingencyPlanQuestionsPage(
      this.application,
      this.contingencyPlanQuestions,
    )

    contingencyPlanQuestionsPage.shouldShowPartnerAgencyNames(this.contingencyPlanPartners)
    contingencyPlanQuestionsPage.completeForm()
    contingencyPlanQuestionsPage.clickSubmit()

    const triggerPlanPage = new ApplyPages.TriggerPlanPage(this.application)
    triggerPlanPage.completeForm()
    triggerPlanPage.clickSubmit()

    this.pages.furtherConsiderations = [
      roomSharingPage,
      vulnerabilityPage,
      previousPlacementsPage,
      cateringPage,
      arsonPage,
      additionalCircumstancesPage,
      contingencyPlanQuestionsPage,
      triggerPlanPage,
    ]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the further considerations task should show a completed status
    tasklistPage.shouldShowTaskStatus('further-considerations', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  private completeMoveOnSection() {
    // Given I click the 'Add move on information' task
    cy.get('[data-cy-task-name="move-on"]').click()

    // And I complete the Placement Duration page
    const placementDurationPage = new ApplyPages.PlacementDurationPage(this.application)
    placementDurationPage.completeForm()
    placementDurationPage.clickSubmit()

    // And I complete the relocation region page
    const relocationRegion = new ApplyPages.RelocationRegionPage(this.application)
    relocationRegion.completeForm()
    relocationRegion.clickSubmit()

    // And I complete the plans in place page
    const plansInPlacePage = new ApplyPages.PlansInPlacePage(this.application)
    plansInPlacePage.completeForm()
    plansInPlacePage.clickSubmit()

    // And I complete the type of accommodation page
    const typeOfAccommodationPage = new ApplyPages.TypeOfAccommodationPage(this.application)
    typeOfAccommodationPage.completeForm()
    typeOfAccommodationPage.clickSubmit()

    const foreignNationalPage = new ApplyPages.ForeignNationalPage(this.application)
    foreignNationalPage.completeForm()
    foreignNationalPage.clickSubmit()

    this.pages.moveOn = [
      placementDurationPage,
      relocationRegion,
      plansInPlacePage,
      typeOfAccommodationPage,
      foreignNationalPage,
    ]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the move on information task should show a completed status
    tasklistPage.shouldShowTaskStatus('move-on', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  private completeDocumentsSection() {
    // Given I click on the Attach Documents task
    cy.get('[data-cy-task-name="attach-required-documents"]').click()
    const attachDocumentsPage = new ApplyPages.AttachDocumentsPage(
      this.documents,
      this.selectedDocuments,
      this.application,
    )

    // Then I should be able to download the documents
    attachDocumentsPage.shouldBeAbleToDownloadDocuments(this.documents)

    // And I attach the relevant documents
    attachDocumentsPage.shouldDisplayDocuments()
    attachDocumentsPage.completeForm()
    attachDocumentsPage.clickSubmit()

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the Attach Documents task should show a completed status
    tasklistPage.shouldShowTaskStatus('attach-required-documents', 'Completed')
    tasklistPage.shouldNotShowSubmitComponents()
  }

  verifyNoDocumentsDisplayed() {
    // Given I click on the Attach Documents task
    cy.get('[data-cy-task-name="attach-required-documents"]').click()
    const attachDocumentsPage = new ApplyPages.AttachDocumentsPage(
      this.documents,
      this.selectedDocuments,
      this.application,
    )
    // Then I should be able to see the no documents message
    attachDocumentsPage.shouldDisplayNoDocuments()
  }

  clickBasicInformation() {
    cy.get('[data-cy-task-name="basic-information"]').click()
  }

  private completeCheckYourAnswersSection() {
    // Given I click the check your answers task
    cy.get('[data-cy-task-name="check-your-answers"]').click()

    // Then I should be on the check your answers page
    const checkYourAnswersPage = new ApplyPages.CheckYourAnswersPage(this.application)

    // And the page should be populated with my answers
    checkYourAnswersPage.shouldShowPersonDetails(this.person as FullPerson)
    checkYourAnswersPage.shouldShowBasicInformationAnswers(this.pages.basicInformation)
    checkYourAnswersPage.shouldShowTypeOfApAnswers(this.pages.typeOfAp)
    checkYourAnswersPage.shouldShowRiskManagementAnswers(this.pages.riskManagement)
    checkYourAnswersPage.shouldShowLocationFactorsAnswers(this.pages.locationFactors)
    checkYourAnswersPage.shouldShowAccessAndHealthcareAnswers(this.pages.accessAndHealthcare)
    checkYourAnswersPage.shouldShowFurtherConsiderationsAnswers(this.pages.furtherConsiderations)
    checkYourAnswersPage.shouldShowContingencyPlanPartners(this.contingencyPlanPartners)
    checkYourAnswersPage.shouldShowMoveOnAnswers(this.pages.moveOn)
    checkYourAnswersPage.shouldShowDocuments(this.selectedDocuments)

    checkYourAnswersPage.shouldShowOptionalOasysSectionsAnswers(this.pages.oasys)
    checkYourAnswersPage.shouldShowCaseNotes(this.selectedPrisonCaseNotes)
    checkYourAnswersPage.shouldShowAdjudications(this.adjudications)
    checkYourAnswersPage.shouldShowAcctAlerts(this.acctAlerts)

    // When I have checked my answers
    checkYourAnswersPage.clickSubmit()

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)

    // And the check your answers task should show a completed status
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  }

  private submitApplication() {
    const tasklistPage = Page.verifyOnPage(ApplyPages.TaskListPage)
    tasklistPage.clickSubmit()

    tasklistPage.shouldShowMissingCheckboxErrorMessage()

    tasklistPage.checkCheckboxByValue('submit')
    tasklistPage.clickSubmit()
  }
}
