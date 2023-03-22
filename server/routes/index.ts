/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../controllers'
import actions from './utils'

import applyRoutes from './apply'
import assessRoutes from './assess'
import matchRoutes from './match'
import manageRoutes from './manage'
import tasksRoutes from './tasks'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const { dashboardController } = controllers

  const { get } = actions(router)

  get('/', dashboardController.index())

  applyRoutes(controllers, router)
  assessRoutes(controllers, router)
  matchRoutes(controllers, router)
  manageRoutes(controllers, router)
  tasksRoutes(controllers, router)

  return router
}
