/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './pagesController'
import ClarificationNotesController from './assessments/clarificationNotesController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { assessmentService, applicationService, userService } = services

  const assessmentsController = new AssessmentsController(assessmentService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService, {
    applicationService,
    userService,
  })
  const clarificationNotesController = new ClarificationNotesController(assessmentService)

  return {
    assessmentsController,
    assessmentPagesController,
    clarificationNotesController,
  }
}

export { AssessmentsController }
