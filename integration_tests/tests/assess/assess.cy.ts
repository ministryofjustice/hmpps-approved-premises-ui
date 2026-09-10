import { Cas1Assessment as Assessment } from '../../../server/@types/shared'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  clarificationNoteFactory,
  documentFactory,
  personFactory,
  userFactory,
} from '../../../server/testutils/factories'

import { overwriteApplicationDocuments } from '../../../server/utils/assessments/documentUtils'
import { acceptanceData } from '../../../server/utils/assessments/acceptanceData'

import AssessHelper from '../../helpers/assess'
import {
  ContingencyPlanSuitabilityPage,
  ListPage,
  PipeSuitabilityPage,
  ShowPage,
  SuitabilityAssessmentPage,
  TaskListPage,
  MatchingInformationPage,
} from '../../pages/assess'
import Page from '../../pages/page'
import { awaitingAssessmentStatuses } from '../../../server/utils/assessments/utils'
import { addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import applicationDocument from '../../fixtures/applicationDocument.json'
import paths from '../../../server/paths/assess'
import { signIn } from '../signIn'
import { getResponses } from '../../../server/utils/applications/getResponses'
import { AND, GIVEN, THEN, updateApplicationReleaseDate, WHEN } from '../../helpers'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as an assessor')
    signIn('assessor')

    AND('there is an application awaiting assessment')
    cy.fixture('applicationData.json').then(applicationData => {
      cy.fixture('assessmentData.json').then(assessmentData => {
        const clarificationNote = clarificationNoteFactory.build({ response: undefined })
        const adjustedApplicationData = updateApplicationReleaseDate(applicationData)

        const assessment = assessmentFactory.build({
          decision: undefined,
          application: { data: adjustedApplicationData, person: personFactory.build(), document: applicationDocument },
          clarificationNotes: [clarificationNote],
        })

        assessment.data = assessmentData
        const documents = documentFactory.buildList(4)
        assessment.application = overwriteApplicationDocuments(assessment.application, documents)
        const user = userFactory.build()

        const assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(
          { ...assessment },
          {
            task: 'sufficient-information',
            page: 'sufficient-information',
            keyValuePairs: {
              sufficientInformation: 'no',
              query: 'clarification note text',
            },
          },
        )

        cy.wrap(assessment).as('assessment')
        cy.wrap(assessmentNeedingClarification).as('assessmentNeedingClarification')
        cy.wrap(documents).as('documents')
        cy.wrap(user).as('user')
        cy.wrap(clarificationNote).as('clarificationNote')
      })
    })
  })

  it('allows me to assess an application', function test() {
    const assessHelper = new AssessHelper(this.assessment, this.documents, this.user, this.clarificationNote)
    assessHelper.setupStubs()
    this.assessment.application.apType = 'normal'

    AND('I start an assessment')
    assessHelper.startAssessment()

    AND('I complete an assessment')
    assessHelper.completeAssessment()

    THEN('the API should have received the correct data')
    cy.task('verifyAssessmentAcceptance', this.assessment).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)
      const expected = acceptanceData(this.assessment)
      expect(body).to.deep.equal(expected)
    })
  })

  it('make a decision page displays selected value', function test() {
    cy.task('stubAssessment', this.assessment)

    cy.visit(paths.assessments.pages.show({ id: this.assessment.id, task: 'make-a-decision', page: 'make-a-decision' }))

    cy.get(`input[name="decision"][value="accept"]`).should('be.checked')
  })

  it('shows a banner when the assessment has come from an appeal', function test() {
    GIVEN('there is an assessment that has come from an appeal')
    const assessmentFromAppeal = { ...this.assessment, createdFromAppeal: true }
    const assessHelper = new AssessHelper(assessmentFromAppeal, this.documents, this.user, this.clarificationNote)
    assessHelper.setupStubs()

    AND('I start an assessment')
    const taskList = assessHelper.startAssessment()

    THEN('I should see a banner telling me that the assessment has come from an appeal')
    taskList.shouldShowAppealBanner()
  })

  it('allows me to create and update a clarification note', function test() {
    let assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(this.assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information',
      keyValuePairs: {
        sufficientInformation: 'no',
        query: 'clarification note text',
      },
    })
    addResponsesToFormArtifact<Assessment>(assessmentNeedingClarification, {
      task: 'sufficient-information',
      page: 'sufficient-information-confirm',
      keyValuePairs: {
        confirm: 'yes',
      },
    })

    assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(assessmentNeedingClarification, {
      task: 'sufficient-information',
      page: 'information-received',
      keyValuePairs: {
        informationReceived: 'yes',
        response: 'response text',
        'responseReceivedOn-year': '2023',
        'responseReceivedOn-month': '09',
        'responseReceivedOn-day': '02',
      },
    })

    const assessHelper = new AssessHelper(
      assessmentNeedingClarification,
      this.documents,
      this.user,
      this.clarificationNote,
    )
    assessHelper.setupStubs()

    AND('I start an assessment')
    assessHelper.startAssessment()

    AND('I add a clarification note')
    assessHelper.addClarificationNote()

    cy.task('verifyClarificationNoteCreate', assessmentNeedingClarification)
      .then(requests => {
        THEN('the API should have had a clarification note added')
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.query).equal('clarification note text')
      })
      .then(() => {
        GIVEN('my assessment is put into an awaiting response state')
        assessHelper.updateAssessmentStatus('awaiting_response')
      })
      .then(() => {
        WHEN('I am redirected to the dashboard')
        const listPage = Page.verifyOnPage(ListPage)

        AND('I click on my assessment')
        listPage.clickAssessment(assessmentNeedingClarification)

        AND('I complete the form')
        assessHelper.updateClarificationNote('yes')

        THEN('I should be redirected to the tasklist page')
        const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

        AND('the sufficient information task should show a completed status')
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')
      })
      .then(() => {
        cy.task('verifyClarificationNoteUpdate', assessmentNeedingClarification)
      })
      .then(requests => {
        AND('the API should have had a clarification note update request')
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.response).equal('response text')
        expect(body.responseReceivedOn).equal('2023-09-02')
      })
  })

  it('should allow me to reject an application where I have not received the correct information', function test() {
    let assessment = addResponsesToFormArtifact<Assessment>(this.assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information',
      keyValuePairs: {
        sufficientInformation: 'no',
        query: 'clarification note text',
      },
    })

    addResponsesToFormArtifact<Assessment>(assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information-confirm',
      keyValuePairs: {
        confirm: 'yes',
      },
    })

    assessment = addResponsesToFormArtifact<Assessment>(assessment, {
      task: 'sufficient-information',
      page: 'information-received',
      keyValuePairs: {
        informationReceived: 'no',
      },
    })
    assessment = addResponsesToFormArtifact<Assessment>(assessment, {
      task: 'make-a-decision',
      page: 'make-a-decision',
      keyValuePairs: {
        decision: 'notNecessaryOrProportionate',
        decisionRationale: 'reject reason',
      },
    })
    delete assessment.data['matching-information']
    const assessHelper = new AssessHelper(assessment, this.documents, this.user, this.clarificationNote)

    assessHelper.setupStubs()

    GIVEN('I start an assessment')
    assessHelper.startAssessment()

    AND('I add a clarification note')
    assessHelper
      .addClarificationNote()
      .then(() => {
        const listPage = Page.verifyOnPage(ListPage)

        WHEN('I click on my assessment')
        listPage.clickAssessment(this.assessment)
        AND('I respond "no" to the "informationReceived" question')
        assessHelper.updateClarificationNote('no')
        THEN('I should be redirected to the tasklist page')
        const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

        AND('the sufficient information task should show a completed status')
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')

        WHEN('I make a decision')
        assessHelper.completeMakeADecisionPage()

        THEN('I should not see the MatchingInformation section')
        tasklistPage.shouldNotShowSection('Information for matching')

        WHEN('I check my answers')
        assessHelper.completeCheckYourAnswersPage()

        AND('I submit the application')
        assessHelper.submitAssessment(false)
      })
      .then(() => {
        THEN('the API should have received the correct data')
        cy.task('verifyAssessmentRejection', assessment).then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          expect(body).to.have.keys('document', 'rejectionRationale', 'rejectionReason')
        })
      })
  })

  it('shows a read-only version of the assessment', function test() {
    GIVEN('I have completed an assessment')
    const updatedAssessment = { ...this.assessment, status: 'completed', document: getResponses(this.assessment) }
    const updatedAssessmentSummary = assessmentSummaryFactory.build({
      id: this.assessment.id,
      status: 'completed',
      person: personFactory.build(),
    })
    cy.task('stubAssessment', updatedAssessment)
    cy.task('stubAssessments', { assessments: [], statuses: awaitingAssessmentStatuses })
    cy.task('stubAssessments', { assessments: [updatedAssessmentSummary], statuses: ['completed'] })

    AND('I visit the list page')
    const listPage = ListPage.visit()

    WHEN('I click on the Completed tab')
    listPage.clickCompleted()

    AND('I click on my assessment')
    listPage.clickAssessment(this.assessment)

    THEN('I should see a read-only version of the assessment')
    const showPage = Page.verifyOnPage(ShowPage, this.assessment)

    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()
  })

  it('invalidates the check your answers step if an answer is changed', function test() {
    GIVEN('there is a complete application in the database')
    cy.fixture('assessmentData.json').then(assessmentData => {
      const assessment = assessmentFactory.build({ data: assessmentData, status: 'in_progress' })
      assessment.application.person = personFactory.build()

      cy.task('stubAssessment', assessment)
      cy.task('stubAssessmentUpdate', assessment)

      AND('I visit the tasklist')
      TaskListPage.visit(assessment)

      AND('I click on a task')
      cy.get('[data-cy-task-name="suitability-assessment"]').click()

      AND('I change my response')
      const suitabilityAssessmentPage = new SuitabilityAssessmentPage(assessment)
      suitabilityAssessmentPage.completeForm()
      suitabilityAssessmentPage.clickSubmit()

      THEN('the application should be updated with the Check Your Answers section removed')
      cy.task('verifyAssessmentUpdate', assessment).then((requests: Array<{ body: string }>) => {
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.data).not.to.have.keys(['check-your-answers'])
      })
    })
  })

  it('does not invalidate the check your answers step if an answer is reviewed and not changed', function test() {
    GIVEN('there is a complete application in the database')

    const assessment = addResponsesToFormArtifact<Assessment>(this.assessment, {
      page: 'application-timeliness',
      task: 'suitability-assessment',
      keyValuePairs: {
        agreeWithShortNoticeReason: 'yes',
        agreeWithShortNoticeReasonComments: 'comments',
        reasonForLateApplication: 'other',
      },
    })

    assessment.application.person = personFactory.build()

    cy.task('stubAssessment', assessment)
    cy.task('stubAssessmentUpdate', assessment)

    AND('I visit the tasklist')
    TaskListPage.visit(assessment)

    AND('I click on a task')
    cy.get('[data-cy-task-name="suitability-assessment"]').click()

    AND('I review a section')
    const suitabilityAssessmentPage = new SuitabilityAssessmentPage(assessment)
    suitabilityAssessmentPage.clickSubmit()
    const pipeSuitabilityAssessmentPage = new PipeSuitabilityPage(assessment)
    pipeSuitabilityAssessmentPage.clickSubmit()
    const contingencyPlanPage = new ContingencyPlanSuitabilityPage(assessment)
    contingencyPlanPage.clickSubmit()

    Page.verifyOnPage(TaskListPage, assessment)

    THEN('the application should be updated with the Check Your Answers section removed')
    cy.task('verifyAssessmentUpdate', assessment).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(3)
      const body = JSON.parse(requests[0].body)

      expect(body.data).to.have.any.keys(['check-your-answers'])
    })
  })

  it('forces me to add a placement duration when the application does not contain a duration', function test() {
    const assessHelper = new AssessHelper(this.assessment, this.documents, this.user, this.clarificationNote)
    assessHelper.setupStubs()
    const { application } = this.assessment

    application.apType = 'normal'
    application.requestedPlacementDuration = undefined
    application.data['move-on']['placement-duration'] = undefined

    WHEN('I start an assessment')
    const taskList = assessHelper.startAssessment()

    WHEN('I visit the matching information page')
    const page = MatchingInformationPage.visit(this.assessment)

    AND('I Have to complete the duration fields')
    page.checkPageNoDuration()

    WHEN('I submit the form')
    page.clickSubmit()

    THEN('I am back on the tasklist')
    taskList.checkOnPage()
  })
})
