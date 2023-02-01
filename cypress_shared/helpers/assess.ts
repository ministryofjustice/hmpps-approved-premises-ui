import {
  ApprovedPremisesAssessment as Assessment,
  AssessmentStatus,
  ClarificationNote,
  Document,
  ApprovedPremisesUser as User,
} from '@approved-premises/api'
import { YesOrNo } from '@approved-premises/ui'
import {
  ClarificationNoteConfirmPage,
  ListPage,
  RequiredActionsPage,
  ReviewPage,
  SufficientInformationPage,
  SuitabilityAssessmentPage,
  TaskListPage,
  MakeADecisionPage,
  InformationReceivedPage,
  MatchingInformationPage,
  CheckYourAnswersPage,
  SubmissionConfirmation,
} from '../pages/assess'
import Page from '../pages/page'
import { updateAssessmentData } from '../../server/form-pages/utils'
import AssessPage from '../pages/assess/assessPage'

export default class AseessHelper {
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
  ) {}

  setupStubs() {
    cy.task('stubAssessments', [this.assessment])
    cy.task('stubAssessment', this.assessment)
    cy.task('stubFindUser', { user: this.user, id: this.assessment.application.createdByUserId })
    cy.task('stubAssessmentUpdate', this.assessment)
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
  }

  updateAssessmentStatus(status: AssessmentStatus) {
    this.assessment.status = status
    cy.task('stubAssessments', [this.assessment])
    return cy.task('stubAssessment', this.assessment)
  }

  startAssessment() {
    // When I visit the assessments dashboard
    const listPage = ListPage.visit([this.assessment])

    // And I click on the assessment
    listPage.clickAssessment(this.assessment)

    // Then I should be taken to the task list
    Page.verifyOnPage(TaskListPage)
  }

  completeAssessment() {
    this.completeReviewApplicationSection()
    this.completeSufficientInformationQuestion()
    this.completeSuitabilityOfAssessmentQuestion()
    this.completeRequiredActionsQuestion()
    this.completeMakeADecisionPage()
    this.completeMatchingInformationPage()
    this.completeCheckYourAnswersPage()
    this.submitAssessment()
  }

  addClarificationNote(note: string) {
    // When I click on the 'review application' link
    cy.get('[data-cy-task-name="review-application"]').click()

    // Then I should be taken to the review page
    const reviewPage = new ReviewPage(this.assessment)

    reviewPage.clickSubmit()
    this.updateAssessmentAndStub(reviewPage)

    // When I click on the 'sufficient-information' link
    cy.get('[data-cy-task-name="sufficient-information"]').click()

    // Then I should be taken to the sufficient information page
    const page = new SufficientInformationPage(this.assessment, 'no')

    // And I answer no to the sufficient information question
    page.completeForm()

    // And I add a note
    page.addNote(note)

    // And I click submit
    page.clickSubmit()

    // Then I should see a confirmation screen
    const confirmationScreen = Page.verifyOnPage(ClarificationNoteConfirmPage)

    // And the PP's details should be visible
    confirmationScreen.confirmUserDetails(this.user)

    // And I should be able to return to the dashboard
    return confirmationScreen.clickBackToDashboard()
  }

  updateClarificationNote(informationReceived: YesOrNo, response?: string, responseReceivedOn?: string) {
    const assessmentStatus = informationReceived === 'yes' ? 'active' : 'pending'
    this.updateAssessmentStatus(assessmentStatus).then(() => {
      const informationReceivedPage = Page.verifyOnPage(InformationReceivedPage, this.assessment, {
        informationReceived,
        response,
        responseReceivedOn,
      })

      this.updateAssessmentAndStub(informationReceivedPage)
        .then(() => {
          // When I complete the form
          informationReceivedPage.completeForm()
          informationReceivedPage.clickSubmit()
        })
        .then(() => {
          this.updateAssessmentAndStub(informationReceivedPage)
        })
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
    this.updateAssessmentAndStub(reviewPage)
    this.pages.reviewApplication = [reviewPage]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

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
    this.updateAssessmentAndStub(page)
    this.pages.sufficientInformation = [page]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the sufficient-information application task should show a completed status
    tasklistPage.shouldShowTaskStatus('sufficient-information', 'Completed')
  }

  private completeSuitabilityOfAssessmentQuestion() {
    // When I click on the 'suitability-assessment' link
    cy.get('[data-cy-task-name="suitability-assessment"]').click()

    // Then I should be taken to the suitability assessment page
    const page = new SuitabilityAssessmentPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)
    this.pages.assessSuitability = [page]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the suitability-assessment application task should show a completed status
    tasklistPage.shouldShowTaskStatus('suitability-assessment', 'Completed')
  }

  private completeRequiredActionsQuestion() {
    // When I click on the 'required-actions' link
    cy.get('[data-cy-task-name="required-actions"]').click()

    // Then I should be taken to the required actions page
    const page = new RequiredActionsPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)
    this.pages.requiredActions = [page]

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the required-actions application task should show a completed status
    tasklistPage.shouldShowTaskStatus('required-actions', 'Completed')
  }

  private completeMakeADecisionPage() {
    // When I click on the 'make-a-decision' link
    cy.get('[data-cy-task-name="make-a-decision"]').click()

    // Then I should be taken to the make a decision page
    const page = new MakeADecisionPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)
    this.pages.makeADecision.push(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

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
    this.updateAssessmentAndStub(page)
    this.pages.matchingInformation.push(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the matching-information application task should show a completed status
    tasklistPage.shouldShowTaskStatus('matching-information', 'Completed')
  }

  private completeCheckYourAnswersPage() {
    // When I click on the 'check-your-answers' link
    cy.get('[data-cy-task-name="check-your-answers"]').click()

    // Then I should be taken to the check your answers page
    const page = new CheckYourAnswersPage(this.assessment)
    page.shouldShowReviewAnswer(this.pages.reviewApplication)
    page.shouldShowSufficientInformationAnswer(this.pages.sufficientInformation)
    page.shouldShowAssessSuitabilityAnswers(this.pages.assessSuitability)
    page.shouldShowRequirementsAnswers(this.pages.requiredActions)
    page.shouldShowDecision(this.pages.makeADecision)
    page.shouldShowMatchingInformation(this.pages.matchingInformation)

    page.clickSubmit()
    this.updateAssessmentAndStub(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the check-your-answers application task should show a completed status
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  }

  submitAssessment() {
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    tasklistPage.checkCheckboxByLabel('confirmed')
    tasklistPage.clickSubmit()
    Page.verifyOnPage(SubmissionConfirmation)
  }

  updateAssessmentAndStub(pageObject: AssessPage) {
    const updatedAssessement = updateAssessmentData(pageObject.pageClass, this.assessment)
    return cy.task('stubAssessment', updatedAssessement)
  }
}
