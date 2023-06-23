/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/match'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const { placementRequestController, bedController, placementRequestBookingsController } = controllers

  get(paths.placementRequests.index.pattern, placementRequestController.index())
  get(paths.placementRequests.show.pattern, placementRequestController.show())

  get(paths.placementRequests.bookingNotMade.confirm.pattern, placementRequestBookingsController.bookingNotMade())
  post(paths.placementRequests.bookingNotMade.create.pattern, placementRequestBookingsController.createBookingNotMade())

  get(paths.placementRequests.beds.search.pattern, bedController.search())
  post(paths.placementRequests.beds.search.pattern, bedController.search())

  get(paths.placementRequests.bookings.confirm.pattern, placementRequestBookingsController.confirm())
  post(paths.placementRequests.bookings.create.pattern, placementRequestBookingsController.create())

  return router
}
