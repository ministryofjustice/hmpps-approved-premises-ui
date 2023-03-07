/* istanbul ignore file */

import { Router } from 'express'

import type { Controllers } from '../controllers'
import actions from './utils'

import applyRoutes from './apply'
import manageRoutes from './manage'
import assessRoutes from './assess'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  const { dashboardController } = controllers

  const { get } = actions(router)

  get('/', dashboardController.index())

  manageRoutes(controllers, router)
  applyRoutes(controllers, router)
  assessRoutes(controllers, router)

  return router
}
