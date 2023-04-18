/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import paths from '../paths/match'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)

  const { placementRequestController, bedController, placementRequestBookingsController } = controllers

  get(paths.placementRequests.index.pattern, placementRequestController.index())
  get(paths.placementRequests.show.pattern, placementRequestController.show())
  get(paths.placementRequests.beds.search.pattern, bedController.search())
  post(paths.placementRequests.beds.search.pattern, bedController.search())

  get(paths.placementRequests.bookings.confirm.pattern, placementRequestBookingsController.confirm())

  return router
}
