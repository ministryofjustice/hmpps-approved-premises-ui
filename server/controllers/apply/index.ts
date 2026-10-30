/* istanbul ignore file */

import ApplicationsController from './applicationsController'
import PagesController from './applications/pagesController'
import OffencesController from './people/offencesController'
import DocumentsController from './people/documentsController'
import WithdrawalsController from './applications/withdrawalsController'
import WithdrawablesController from './withdrawablesController'
import ExpiryController from './applications/expiryController'
import NotesController from './applications/notesController'
import { FormDataService } from '../../services'

import type { Services } from '../../services'
import AppealsController from './appealsController'

export const controllers = (services: Services) => {
  const {
    applicationService,
    personService,
    premisesService,
    userService,
    apAreaService,
    appealService,
    placementService,
    assessmentService,
    formDataService
  } = services

  const applicationsController = new ApplicationsController(applicationService, assessmentService, personService, formDataService)
  const pagesController = new PagesController(applicationService, {
    personService,
    applicationService,
    premisesService,
    userService,
    apAreaService,
    formDataService,
  })
  const offencesController = new OffencesController(personService, applicationService, formDataService)
  const documentsController = new DocumentsController(personService)
  const withdrawalsController = new WithdrawalsController(applicationService)
  const notesController = new NotesController(applicationService)
  const withdrawablesController = new WithdrawablesController(applicationService, placementService)
  const appealsController = new AppealsController(appealService, applicationService)
  const expiryController = new ExpiryController(applicationService)

  return {
    appealsController,
    applicationsController,
    pagesController,
    offencesController,
    documentsController,
    withdrawalsController,
    notesController,
    withdrawablesController,
    expiryController,
  }
}

export { ApplicationsController }
