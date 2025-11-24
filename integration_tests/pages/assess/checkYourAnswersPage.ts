import { Cas1Assessment as Assessment } from '../../../server/@types/shared'
import CheckYourAnswers from '../../../server/form-pages/assess/checkYourAnswers/checkYourAnswersTask/checkYourAnswers'
import AssessPage from './assessPage'

export default class CheckYourAnswersPage extends AssessPage {
  tasklistPage: CheckYourAnswers

  constructor(assessment: Assessment) {
    super('Check your answers', assessment, 'check-your-answers', 'check-your-answers', '')
  }

  shouldShowReviewAnswer(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle('review-application', 'Review application and documents')
    this.shouldShowAnswersForTask('review-application', pages)
  }

  shouldShowSufficientInformationAnswer(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle(
      'sufficient-information',
      'Check there is sufficient information to make a decision',
    )
    this.shouldShowAnswersForTask('sufficient-information', pages)
  }

  shouldShowAssessSuitabilityAnswers(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle('suitability-assessment', 'Assess suitability of application')
    this.shouldShowAnswersForTask('suitability-assessment', pages)
  }

  shouldShowRequirementsAnswers(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle('required-actions', 'Provide any requirements to support placement')
    this.shouldShowAnswersForTask('required-actions', pages)
  }

  shouldShowDecision(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle('make-a-decision', 'Make a decision')
    this.shouldShowAnswersForTask('make-a-decision', pages)
  }

  shouldShowMatchingInformation(pages: Array<AssessPage>) {
    this.shouldShowCheckYourAnswersTitle('matching-information', 'Matching information')
    this.shouldShowAnswersForTask('matching-information', pages)
  }

  private shouldShowAnswersForTask(taskName: string, pages: Array<AssessPage>) {
    cy.get(`[data-cy-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          this.assertDefinition(key, responses[key] as string)
        })
      })
    })
  }
}
