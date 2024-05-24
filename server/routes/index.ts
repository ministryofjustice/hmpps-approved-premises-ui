/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'

import actions from './utils'
import applyRoutes from './apply'
import assessRoutes from './assess'
import matchRoutes from './match'
import manageRoutes from './manage'
import v2manageRoutes from './v2Manage'
import tasksRoutes from './tasks'
import placementApplicationRoutes from './placementApplications'
import adminRoutes from './admin'
import peopleRoutes from './people'

export default function routes(controllers: Controllers, services: Partial<Services>): Router {
  const router = Router()

  const { dashboardController } = controllers

  const { get } = actions(router, services.auditService)

  get('/', dashboardController.index())

  applyRoutes(controllers, router, services)
  assessRoutes(controllers, router, services)
  matchRoutes(controllers, router, services)
  manageRoutes(controllers, router, services)
  v2manageRoutes(controllers, router, services)
  tasksRoutes(controllers, router, services)
  placementApplicationRoutes(controllers, router, services)
  adminRoutes(controllers, router, services)
  peopleRoutes(controllers, router, services)

  return router
}
