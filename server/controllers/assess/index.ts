/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './assessments/pagesController'
import ClarificationNotesController from './assessments/clarificationNotesController'
import SupportingInformationController from './supportingInformationController'
import AllocationsController from './applications/allocationsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { assessmentService, applicationService, userService } = services

  const assessmentsController = new AssessmentsController(assessmentService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService, {
    applicationService,
    userService,
  })
  const clarificationNotesController = new ClarificationNotesController(assessmentService, userService)
  const supportingInformationController = new SupportingInformationController(assessmentService)
  const allocationsController = new AllocationsController(applicationService, userService)

  return {
    assessmentsController,
    assessmentPagesController,
    clarificationNotesController,
    supportingInformationController,
    allocationsController,
  }
}
