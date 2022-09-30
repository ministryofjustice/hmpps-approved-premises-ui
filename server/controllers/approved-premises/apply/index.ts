/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'

import { Services } from '../../../services/approved-premises'

export const controllers = (services: Services) => {
  const { applicationService, personService } = services
  const applicationsController = new ApplicationsController(applicationService, personService)
  const pagesController = new PagesController(applicationService, { personService })

  return {
    applicationsController,
    pagesController,
  }
}

export { ApplicationsController }
