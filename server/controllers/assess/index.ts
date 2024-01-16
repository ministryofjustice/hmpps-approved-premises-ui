/* istanbul ignore file */

import AssessmentsController from './assessmentsController'
import AssessmentPagesController from './assessments/pagesController'
import SupportingInformationController from './supportingInformationController'

import type { Services } from '../../services'
import { DataServices } from '../../@types/ui'

export const controllers = (services: Services) => {
  const { assessmentService, applicationService, userService } = services

  const assessmentsController = new AssessmentsController(assessmentService)
  const assessmentPagesController = new AssessmentPagesController(assessmentService, {
    applicationService,
    userService,
    assessmentService,
  } as unknown as DataServices)
  const supportingInformationController = new SupportingInformationController(assessmentService)

  return {
    assessmentsController,
    assessmentPagesController,
    supportingInformationController,
  }
}
