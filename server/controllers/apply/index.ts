/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, personService } = services
  const applicationsController = new ApplicationsController(applicationService, personService)
  const pagesController = new PagesController(applicationService, { personService, applicationService })
  const offencesController = new OffencesController(personService)
  const documentsController = new DocumentsController(personService)

  return {
    applicationsController,
    pagesController,
    offencesController,
    documentsController,
  }
}

export { ApplicationsController }
