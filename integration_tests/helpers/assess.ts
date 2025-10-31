import {
  ApprovedPremisesAssessment as Assessment,
  ApprovedPremisesAssessmentStatus as AssessmentStatus,
  Cas1AssessmentSummary,
  ClarificationNote,
  Document,
  ApprovedPremisesUser as User,
} from '@approved-premises/api'
import { YesOrNo } from '@approved-premises/ui'
import {
  ApplicationTimelinessPage,
  CheckYourAnswersPage,
  ClarificationNoteConfirmPage,
  InformationReceivedPage,
  ListPage,
  MakeADecisionPage,
  MatchingInformationPage,
  RequiredActionsPage,
  ReviewPage,
  SubmissionConfirmation,
  SufficientInformationPage,
  SuitabilityAssessmentPage,
  TaskListPage,
} from '../pages/assess'
import Page from '../pages/page'
import AssessPage from '../pages/assess/assessPage'
import { assessmentSummaryFactory, personFactory } from '../../server/testutils/factories'
import PipeSuitabilityPage from '../pages/assess/pipeSuitability'
import ContingencyPlanSuitabilityPage from '../pages/assess/contingencyPlanSuitability'

import { awaitingAssessmentStatuses } from '../../server/utils/assessments/utils'
import SufficientInformationConfirmPage from '../pages/assess/sufficientInformationConfirmPage'

export default class AseessHelper {
  assessmentSummary: Cas1AssessmentSummary

  pages = {
    reviewApplication: [] as Array<AssessPage>,
    sufficientInformation: [] as Array<AssessPage>,
    assessSuitability: [] as Array<AssessPage>,
    requiredActions: [] as Array<AssessPage>,
    makeADecision: [] as Array<AssessPage>,
    matchingInformation: [] as Array<AssessPage>,
  }

  constructor(
    private readonly assessment: Assessment,
    private readonly documents: Array<Document>,
    private readonly user: User,
    private readonly clarificationNote?: ClarificationNote,
  ) {
    this.assessmentSummary = assessmentSummaryFactory.build({ id: this.assessment.id, person: personFactory.build() })
  }

  setupStubs() {
    cy.task('stubAssessments', {
      assessments: [this.assessmentSummary],
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    })

    cy.task('stubJourney', this.assessment)
    cy.task('stubFindUser', { user: this.user, id: this.assessment.application.createdByUserId })
    cy.task('stubClarificationNoteCreate', {
      assessment: this.assessment,
      clarificationNote: { query: this.clarificationNote },
    })
    cy.task('stubClarificationNoteUpdate', {
      assessment: this.assessment,
      clarificationNoteId: this.clarificationNote.id,
      clarificationNote: { query: this.clarificationNote },
    })
    cy.task('stubApplicationDocuments', { application: this.assessment.application, documents: this.documents })
    this.documents.forEach(document => {
      cy.task('stubPersonDocument', { person: this.assessment.application.person, document })
    })
    cy.task('stubAssessmentRejection', this.assessment)
    cy.task('stubAssessmentAcceptance', this.assessment)
  }

  updateAssessmentStatus(status: AssessmentStatus) {
    this.assessmentSummary.status = status
    this.assessment.status = status
    return cy.task('stubAssessments', { assessments: [this.assessmentSummary], statuses: [status] })
  }

  startAssessment() {
    // When I visit the assessments dashboard
    const listPage = ListPage.visit()

    // And I click on the assessment
    listPage.clickAssessment(this.assessment)

    // Then I should be taken to the task list
    return Page.verifyOnPage(TaskListPage, this.assessment)
  }

  completeAssessment(options: { isShortNoticeApplication?: boolean } = {}) {
    this.completeReviewApplicationSection()
    this.completeSufficientInformationQuestion()
    this.completeSuitabilityOfAssessmentQuestion({ isShortNoticeApplication: options.isShortNoticeApplication })
    this.completeRequiredActionsQuestion()
    this.completeMakeADecisionPage()
    this.completeMatchingInformationPage()
    this.completeCheckYourAnswersPage()
    this.submitAssessment()
  }

  addClarificationNote() {
    // When I click on the 'review application' link
    cy.get('[data-cy-task-name="review-application"]').click()

    // Then I should be taken to the review page
    const reviewPage = new ReviewPage(this.assessment)
    reviewPage.completeForm()
    reviewPage.clickSubmit()

    // When I click on the 'sufficient-information' link
    cy.get('[data-cy-task-name="sufficient-information"]').click()

    // Then I should be taken to the sufficient information page
    const page = new SufficientInformationPage(this.assessment)

    // And I answer no to the sufficient information question
    page.completeForm()

    // And I add a note
    page.addNote()

    // And I click submit
    page.clickSubmit()

    // And I confirm that I want to send the note
    const confirmPage = new SufficientInformationConfirmPage(this.assessment)
    confirmPage.completeForm()
    confirmPage.clickSubmit()

    // Then I should see a confirmation screen
    const confirmationScreen = Page.verifyOnPage(ClarificationNoteConfirmPage)

    // And the PP's details should be visible
    confirmationScreen.confirmUserDetails(this.assessment.application)

    // And I should be able to return to the dashboard
    return confirmationScreen.clickBackToDashboard()
  }

  updateClarificationNote(informationReceived: YesOrNo) {
    const assessmentStatus = informationReceived === 'yes' ? 'in_progress' : 'awaiting_response'
    this.updateAssessmentStatus(assessmentStatus).then(() => {
      const informationReceivedPage = Page.verifyOnPage(InformationReceivedPage, this.assessment)
      // Then I should see the information I requested
      informationReceivedPage.shouldShowQuery()

      // When I complete the form
      informationReceivedPage.completeForm()
      informationReceivedPage.clickSubmit()
    })
  }

  private completeReviewApplicationSection() {
    // When I click on the 'review application' link
    cy.get('[data-cy-task-name="review-application"]').click()

    // Then I should be taken to the review page
    const reviewPage = new ReviewPage(this.assessment)

    // And be able to complete the form
    reviewPage.shouldShowAnswers(this.assessment)
    reviewPage.completeForm()
    reviewPage.shouldBeAbleToDownloadDocuments(this.documents)
    reviewPage.clickSubmit()

    this.pages.reviewApplication = [reviewPage]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the review application task should show a completed status
    tasklistPage.shouldShowTaskStatus('review-application', 'Completed')
  }

  private completeSufficientInformationQuestion() {
    // When I click on the 'sufficient-information' link
    cy.get('[data-cy-task-name="sufficient-information"]').click()

    // Then I should be taken to the sufficient information page
    const page = new SufficientInformationPage(this.assessment)
    page.completeForm()
    page.clickSubmit()

    this.pages.sufficientInformation = [page]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the sufficient-information application task should show a completed status
    tasklistPage.shouldShowTaskStatus('sufficient-information', 'Completed')
  }

  completeSuitabilityOfAssessmentQuestion(options: { isShortNoticeApplication?: boolean } = {}) {
    // When I click on the 'suitability-assessment' link
    cy.get('[data-cy-task-name="suitability-assessment"]').click()

    // Then I should be taken to the suitability assessment page
    const suitabilityAssessmentPage = new SuitabilityAssessmentPage(this.assessment)
    suitabilityAssessmentPage.completeForm()
    suitabilityAssessmentPage.clickSubmit()

    const pipeSuitabilityPage = new PipeSuitabilityPage(this.assessment)
    pipeSuitabilityPage.completeForm()
    pipeSuitabilityPage.clickSubmit()

    this.pages.assessSuitability = [suitabilityAssessmentPage, pipeSuitabilityPage]

    if (!options.isShortNoticeApplication) {
      const contingencyPlanSuitabilityPage = new ContingencyPlanSuitabilityPage(this.assessment)
      contingencyPlanSuitabilityPage.completeForm()
      contingencyPlanSuitabilityPage.clickSubmit()
    }

    if (options.isShortNoticeApplication) {
      // Then I should be taken to the application timeliness page
      const applicationTimelinessPage = new ApplicationTimelinessPage(this.assessment)
      applicationTimelinessPage.completeForm()
      applicationTimelinessPage.clickSubmit()

      const contingencyPlanSuitabilityPage = new ContingencyPlanSuitabilityPage(this.assessment)
      contingencyPlanSuitabilityPage.completeForm()
      contingencyPlanSuitabilityPage.clickSubmit()

      this.pages.assessSuitability = [
        ...this.pages.assessSuitability,
        applicationTimelinessPage,
        contingencyPlanSuitabilityPage,
      ]
    }

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the suitability-assessment application task should show a completed status
    tasklistPage.shouldShowTaskStatus('suitability-assessment', 'Completed')
  }

  completeRequiredActionsQuestion() {
    // When I click on the 'required-actions' link
    cy.get('[data-cy-task-name="required-actions"]').click()

    // Then I should be taken to the required actions page
    const page = new RequiredActionsPage(this.assessment)
    page.completeForm()
    page.clickSubmit()

    this.pages.requiredActions = [page]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the required-actions application task should show a completed status
    tasklistPage.shouldShowTaskStatus('required-actions', 'Completed')
  }

  completeMakeADecisionPage() {
    // When I click on the 'make-a-decision' link
    cy.get('[data-cy-task-name="make-a-decision"]').click()

    // Then I should be taken to the make a decision page
    const page = new MakeADecisionPage(this.assessment)
    page.enterDecisionRationale()
    page.completeForm()
    page.clickSubmit()

    this.pages.makeADecision.push(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the make-a-decision application task should show a completed status
    tasklistPage.shouldShowTaskStatus('make-a-decision', 'Completed')
  }

  private completeMatchingInformationPage() {
    // When I click on the 'matching-information' link
    cy.get('[data-cy-task-name="matching-information"]').click()

    // Then I should be taken to the matching information page
    const page = new MatchingInformationPage(this.assessment)
    page.completeForm()
    page.clickSubmit()

    this.pages.matchingInformation.push(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the matching-information application task should show a completed status
    tasklistPage.shouldShowTaskStatus('matching-information', 'Completed')
  }

  completeCheckYourAnswersPage() {
    // When I click on the 'check-your-answers' link
    cy.get('[data-cy-task-name="check-your-answers"]').click()

    // Then I should be taken to the check your answers page
    const page = new CheckYourAnswersPage(this.assessment)
    page.shouldShowReviewAnswer(this.pages.reviewApplication)
    page.shouldShowSufficientInformationAnswer(this.pages.sufficientInformation)

    if (this.pages.assessSuitability.length) {
      page.shouldShowAssessSuitabilityAnswers(this.pages.assessSuitability)
    }

    if (this.pages.requiredActions.length) {
      page.shouldShowRequirementsAnswers(this.pages.requiredActions)
    }

    page.shouldShowDecision(this.pages.makeADecision)

    if (this.pages.matchingInformation.length) {
      page.shouldShowMatchingInformation(this.pages.matchingInformation)
    }

    page.clickSubmit()

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

    // And the check-your-answers application task should show a completed status
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  }

  submitAssessment(isSuitable = true) {
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)
    tasklistPage.clickSubmit()

    tasklistPage.shouldShowMissingCheckboxErrorMessage()

    tasklistPage.checkCheckboxByValue('confirmed')
    tasklistPage.clickSubmit()
    Page.verifyOnPage(SubmissionConfirmation, isSuitable)
  }
}
