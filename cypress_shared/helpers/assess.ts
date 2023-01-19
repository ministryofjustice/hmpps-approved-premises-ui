import { ApprovedPremisesAssessment as Assessment, ClarificationNote, Document, User } from '@approved-premises/api'
import {
  ClarificationNoteConfirmPage,
  ListPage,
  RequiredActionsPage,
  ReviewPage,
  SufficientInformationPage,
  SuitabilityAssessmentPage,
  TaskListPage,
  MakeADecisionPage,
} from '../pages/assess'
import Page from '../pages/page'
import { updateAssessmentData } from '../../server/form-pages/utils'
import AssessPage from '../pages/assess/assessPage'

export default class AseessHelper {
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
    if (this.clarificationNote) {
      cy.task('stubClarificationNoteCreate', {
        assessment: this.assessment,
        clarificationNote: { query: this.clarificationNote },
      })
    }
    cy.task('stubApplicationDocuments', { application: this.assessment.application, documents: this.documents })
    this.documents.forEach(document => {
      cy.task('stubPersonDocument', { person: this.assessment.application.person, document })
    })
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
  }

  addClarificationNote(note: string) {
    this.completeReviewApplicationSection()

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
    confirmationScreen.clickBackToDashboard()

    Page.verifyOnPage(ListPage)
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

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the suitability-assessment application task should show a completed status
    tasklistPage.shouldShowTaskStatus('suitability-assessment', 'Completed')
  }

  private completeRequiredActionsQuestion() {
    // When I click on the 'required-actions' link
    cy.get('[data-cy-task-name="required-actions"]').click()

    // Then I should be taken to the suitability assessment page
    const page = new RequiredActionsPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the required-actions application task should show a completed status
    tasklistPage.shouldShowTaskStatus('required-actions', 'Completed')
  }

  private completeMakeADecisionPage() {
    // When I click on the 'make-a-decision' link
    cy.get('[data-cy-task-name="make-a-decision"]').click()

    // Then I should be taken to the suitability assessment page
    const page = new MakeADecisionPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the make-a-decision application task should show a completed status
    tasklistPage.shouldShowTaskStatus('make-a-decision', 'Completed')
  }

  updateAssessmentAndStub(pageObject: AssessPage) {
    const updatedAssessement = updateAssessmentData(pageObject.pageClass, this.assessment)
    cy.task('stubAssessment', updatedAssessement)
  }
}
