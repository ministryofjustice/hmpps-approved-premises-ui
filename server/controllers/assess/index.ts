/* istanbul ignore file */

import AssessmentsController from './assessmentsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { assessmentService } = services
  const assessmentsController = new AssessmentsController(assessmentService)

  return {
    assessmentsController,
  }
}

export { AssessmentsController }
