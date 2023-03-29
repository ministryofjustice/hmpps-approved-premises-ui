/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/match'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)

  const { placementRequestController, bedController } = controllers

  get(paths.placementRequests.index.pattern, placementRequestController.index())
  get(paths.beds.search.pattern, bedController.search())

  return router
}
