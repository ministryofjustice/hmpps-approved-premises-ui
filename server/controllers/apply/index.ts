/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'
import WithdrawalsController from './applications/withdrawalsController'

import type { Services } from '../../services'

export const controllers = (services: Services) => {
  const { applicationService, personService, premisesService } = services
  const applicationsController = new ApplicationsController(applicationService, personService)
  const pagesController = new PagesController(applicationService, {
    personService,
    applicationService,
    premisesService,
  })
  const offencesController = new OffencesController(personService)
  const documentsController = new DocumentsController(personService)
  const withdrawalsController = new WithdrawalsController(applicationService)

  return {
    applicationsController,
    pagesController,
    offencesController,
    documentsController,
    withdrawalsController,
  }
}

export { ApplicationsController }
