/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './pagesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { assessmentService } = services

  const assessmentsController = new AssessmentsController(assessmentService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService)

  return {
    assessmentsController,
    assessmentPagesController,
  }
}

export { AssessmentsController }
