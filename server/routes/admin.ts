/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/admin'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const {
    adminPlacementRequestsController,
    placementRequestsBookingsController,
    placementRequestWithdrawalsController,
    placementRequestUnableToMatchController,
    reportsController,
  } = controllers

  get(paths.admin.placementRequests.index.pattern, adminPlacementRequestsController.index(), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
  })
  get(paths.admin.placementRequests.search.pattern, adminPlacementRequestsController.search(), {
    auditEvent: 'ADMIN_SEARCH_PLACEMENT_REQUESTS',
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

  get(paths.admin.placementRequests.withdrawal.new.pattern, placementRequestWithdrawalsController.new(), {
    auditEvent: 'ADMIN_NEW_PLACEMENT_REQUEST_WITHDRAWL',
  })
  post(paths.admin.placementRequests.withdrawal.create.pattern, placementRequestWithdrawalsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.admin.placementRequests.withdrawal.new.pattern,
        auditEvent: 'ADMIN_CREATE_PLACEMENT_REQUEST_WITHDRAWL_FAILURE',
      },
      {
        path: paths.admin.placementRequests.show.pattern,
        auditEvent: 'ADMIN_CREATE_PLACEMENT_REQUEST_WITHDRAWL_CANCELLATION',
      },
      {
        path: paths.admin.placementRequests.index.pattern,
        auditEvent: 'ADMIN_CREATE_PLACEMENT_REQUEST_WITHDRAWL_SUCCESS',
      },
    ],
  })

  get(paths.admin.placementRequests.unableToMatch.new.pattern, placementRequestUnableToMatchController.new(), {
    auditEvent: 'ADMIN_NEW_PLACEMENT_REQUEST_UNABLE_TO_MATCH',
  })

  get(paths.admin.reports.new.pattern, reportsController.new(), {
    auditEvent: 'ADMIN_ACCESS_REPORTS_SECTION',
  })

  post(paths.admin.reports.create.pattern, reportsController.create(), {
    auditEvent: 'ADMIN_GENERATE_LOST_BEDS_REPORT',
    redirectAuditEventSpecs: [
      {
        path: paths.admin.reports.new.pattern,
        auditEvent: 'ADMIN_GENERATE_LOST_BEDS_REPORT_ERROR',
      },
    ],
  })

  return router
}
