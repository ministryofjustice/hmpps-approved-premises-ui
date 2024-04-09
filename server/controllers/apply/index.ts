/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'
import WithdrawalsController from './applications/withdrawalsController'
import WithdrawablesController from './withdrawablesController'
import NotesController from './applications/notesController'

import type { Services } from '../../services'
import AppealsController from './appealsController'

export const controllers = (services: Services) => {
  const {
    applicationService,
    personService,
    premisesService,
    userService,
    apAreaService,
    bookingService,
    appealService,
    featureFlagService,
  } = services
  const applicationsController = new ApplicationsController(applicationService, personService, featureFlagService)
  const pagesController = new PagesController(applicationService, {
    personService,
    applicationService,
    premisesService,
    userService,
    apAreaService,
    featureFlagService,
  })
  const offencesController = new OffencesController(personService)
  const documentsController = new DocumentsController(personService)
  const withdrawalsController = new WithdrawalsController(applicationService)
  const notesController = new NotesController(applicationService)
  const withdrawablesController = new WithdrawablesController(applicationService, bookingService)
  const appealsController = new AppealsController(appealService, applicationService)

  return {
    appealsController,
    applicationsController,
    pagesController,
    offencesController,
    documentsController,
    withdrawalsController,
    notesController,
    withdrawablesController,
  }
}

export { ApplicationsController }
