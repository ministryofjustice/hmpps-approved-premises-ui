/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import CheckYourAnswersController from './applications/checkYourAnswersController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, personService } = services
  const applicationsController = new ApplicationsController(applicationService, personService)
  const pagesController = new PagesController(applicationService, { personService })
  const checkYourAnswersController = new CheckYourAnswersController(applicationService)

  return {
    applicationsController,
    pagesController,
    checkYourAnswersController,
  }
}

export { ApplicationsController }
