/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './assessments/pagesController'
import SupportingInformationController from './supportingInformationController'

import { type Services } from '../../services'
import { DataServices } from '../../@types/ui'

export const controllers = (services: Services) => {
  const { assessmentService, applicationService, userService, taskService, featureFlagService } = services

  const assessmentsController = new AssessmentsController(assessmentService, taskService, featureFlagService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService, {
    applicationService,
    userService,
    assessmentService,
    featureFlagService,
  } as unknown as DataServices)
  const supportingInformationController = new SupportingInformationController(assessmentService)

  return {
    assessmentsController,
    assessmentPagesController,
    supportingInformationController,
  }
}
