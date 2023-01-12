/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './pagesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { assessmentService, applicationService, userService } = services

  const assessmentsController = new AssessmentsController(assessmentService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService, {
    applicationService,
    userService,
  })

  return {
    assessmentsController,
    assessmentPagesController,
  }
}

export { AssessmentsController }
