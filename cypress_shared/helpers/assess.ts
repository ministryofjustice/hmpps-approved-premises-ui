import { ApprovedPremisesAssessment as Assessment, Document } from '@approved-premises/api'
import { ReviewPage, ListPage, TaskListPage, SufficientInformationPage } from '../pages/assess'
import Page from '../pages/page'
import { updateAssessmentData } from '../../server/form-pages/utils'
import AssessPage from '../pages/assess/assessPage'

export default class AseessHelper {
  constructor(private readonly assessment: Assessment, private readonly documents: Array<Document>) {}

  setupStubs() {
    cy.task('stubAssessments', [this.assessment])
    cy.task('stubAssessment', this.assessment)
    cy.task('stubAssessmentUpdate', this.assessment)
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
    // When I click on the 'suitability-assessment' link
    cy.get('[data-cy-task-name="sufficient-information"]').click()

    // Then I should be taken to the sufficient information page
    const page = new SufficientInformationPage(this.assessment)
    page.completeForm()
    page.clickSubmit()
    this.updateAssessmentAndStub(page)

    // Then I should be taken to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the suitability-assessment application task should show a completed status
    tasklistPage.shouldShowTaskStatus('review-application', 'Completed')
  }

  updateAssessmentAndStub(pageObject: AssessPage) {
    const updatedAssessement = updateAssessmentData(pageObject.pageClass, this.assessment)
    cy.task('stubAssessment', updatedAssessement)
  }
}
