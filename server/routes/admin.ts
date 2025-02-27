/* istanbul ignore file */

import { Router } from 'express'
import { Controllers } from '../controllers'
import type { Services } from '../services'

import paths from '../paths/admin'
import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post, put, delete: deleteAction } = actions(router, services.auditService)

  const {
    redirectController,
    adminPlacementRequestsController,
    cruDashboardController,
    placementRequestsBookingsController,
    placementRequestWithdrawalsController,
    reportsController,
    userManagementController,
    deliusUserController,
  } = controllers

  get(paths.admin.cruDashboard.index.pattern, cruDashboardController.index(), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
  })
  post(paths.admin.placementRequests.index.pattern, cruDashboardController.index(), {
    auditEvent: 'ADMIN_LIST_FILTER_PLACEMENT_REQUESTS',
  })
  get(paths.admin.cruDashboard.search.pattern, cruDashboardController.search(), {
    auditEvent: 'ADMIN_SEARCH_PLACEMENT_REQUESTS',
  })

  get(paths.admin.placementRequests.index.pattern, redirectController.redirect(paths.admin.cruDashboard.index), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
  })
  post(paths.admin.placementRequests.index.pattern, redirectController.redirect(paths.admin.cruDashboard.index), {
    auditEvent: 'ADMIN_LIST_FILTER_PLACEMENT_REQUESTS',
  })
  get(paths.admin.placementRequests.search.pattern, redirectController.redirect(paths.admin.cruDashboard.search), {
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

  get(paths.admin.userManagement.index.pattern, userManagementController.index(), {
    auditEvent: 'ADMIN_USER_MANAGEMENT_DASHBOARD',
  })
  get(paths.admin.userManagement.new.pattern, deliusUserController.new(), {
    auditEvent: 'ADMIN_DELIUS_SEARCH_FOR_USER',
  })
  get(paths.admin.userManagement.edit.pattern, userManagementController.edit(), {
    auditEvent: 'ADMIN_USER_PERMISSIONS_PAGE',
  })
  get(paths.admin.userManagement.confirmDelete.pattern, userManagementController.confirmDelete(), {
    auditEvent: 'ADMIN_USER_DELETION_CONFIRMATION_PAGE',
  })
  deleteAction(paths.admin.userManagement.delete.pattern, userManagementController.delete(), {
    auditEvent: 'ADMIN_USER_DELETION',
  })

  post(paths.admin.userManagement.searchDelius.pattern, deliusUserController.search(), {
    auditEvent: 'ADMIN_USER_PERMISSIONS_PAGE',
  })
  put(paths.admin.userManagement.update.pattern, userManagementController.update(), {
    auditEvent: 'ADMIN_UPDATE_USER_PERMISSIONS_SUCCESS',
  })
  post(paths.admin.userManagement.search.pattern, userManagementController.search(), {
    auditEvent: 'ADMIN_SEARCH_USERS',
  })

  return router
}
