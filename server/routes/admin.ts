/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/admin'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const { adminPlacementRequestsController, placementRequestsBookingsController } = controllers

  get(paths.admin.placementRequests.index.pattern, adminPlacementRequestsController.index(), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
  })
  get(paths.admin.placementRequests.show.pattern, adminPlacementRequestsController.show(), {
    auditEvent: 'ADMIN_SHOW_PLACEMENT_REQUEST',
  })

  get(paths.admin.placementRequests.bookings.new.pattern, placementRequestsBookingsController.new(), {
    auditEvent: 'ADMIN_PLACEMENT_REQUEST_NEW_BOOKING',
  })

  post(paths.admin.placementRequests.bookings.create.pattern, placementRequestsBookingsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.admin.placementRequests.bookings.new.pattern,
        auditEvent: 'ADMIN_PLACEMENT_REQUEST_CREATE_BOOKING_FAILURE',
      },
      {
        path: paths.admin.placementRequests.show.pattern,
        auditEvent: 'ADMIN_PLACEMENT_REQUEST_CREATE_BOOKING_SUCCESS',
      },
    ],
  })

  return router
}
