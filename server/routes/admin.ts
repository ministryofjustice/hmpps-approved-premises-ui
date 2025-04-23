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
    changeRequestsController,
  } = controllers

  get(paths.admin.cruDashboard.index.pattern, cruDashboardController.index(), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
    allowedPermissions: ['cas1_view_cru_dashboard'],
  })
  get(paths.admin.cruDashboard.changeRequests.pattern, cruDashboardController.changeRequests(), {
    auditEvent: 'ADMIN_LIST_CHANGE_REQUESTS',
    allowedPermissions: ['cas1_change_request_list'],
  })
  get(paths.admin.cruDashboard.search.pattern, cruDashboardController.search(), {
    auditEvent: 'ADMIN_SEARCH_PLACEMENT_REQUESTS',
    allowedPermissions: ['cas1_view_cru_dashboard'],
  })
  get(paths.admin.cruDashboard.downloadOccupancyReport.pattern, cruDashboardController.downloadReport(), {
    auditEvent: 'ADMIN_DOWNLOAD_OCCUPANCY_REPORT',
    allowedPermissions: ['cas1_premises_capacity_report_view'],
  })

  // Change requests
  get(paths.admin.placementRequests.changeRequests.review.pattern, changeRequestsController.review(), {
    auditEvent: 'ADMIN_CHANGE_REQUEST_REVIEW',
    allowedPermissions: ['cas1_placement_appeal_assess'],
  })
  post(paths.admin.placementRequests.changeRequests.review.pattern, changeRequestsController.decide(), {
    auditEvent: 'ADMIN_CHANGE_REQUEST_ACTION',
    allowedPermissions: ['cas1_placement_appeal_assess'],
  })

  get(paths.admin.placementRequests.index.pattern, redirectController.redirect(paths.admin.cruDashboard.index), {
    auditEvent: 'ADMIN_LIST_PLACEMENT_REQUESTS',
    allowedPermissions: ['cas1_view_cru_dashboard'],
  })
  post(paths.admin.placementRequests.index.pattern, redirectController.redirect(paths.admin.cruDashboard.index), {
    auditEvent: 'ADMIN_LIST_FILTER_PLACEMENT_REQUESTS',
    allowedPermissions: ['cas1_view_cru_dashboard'],
  })
  get(paths.admin.placementRequests.search.pattern, redirectController.redirect(paths.admin.cruDashboard.search), {
    auditEvent: 'ADMIN_SEARCH_PLACEMENT_REQUESTS',
    allowedPermissions: ['cas1_view_cru_dashboard'],
  })

  get(paths.admin.placementRequests.show.pattern, adminPlacementRequestsController.show(), {
    auditEvent: 'ADMIN_SHOW_PLACEMENT_REQUEST',
  })

  get(paths.admin.placementRequests.bookings.new.pattern, placementRequestsBookingsController.new(), {
    auditEvent: 'ADMIN_PLACEMENT_REQUEST_NEW_BOOKING',
    allowedPermissions: ['cas1_booking_create'],
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
    allowedPermissions: ['cas1_booking_create'],
  })

  // TODO: determine permissions required for placement request withdrawals
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
    allowedPermissions: ['cas1_reports_view'],
  })

  post(paths.admin.reports.create.pattern, reportsController.create(), {
    auditEvent: 'ADMIN_GENERATE_LOST_BEDS_REPORT',
    redirectAuditEventSpecs: [
      {
        path: paths.admin.reports.new.pattern,
        auditEvent: 'ADMIN_GENERATE_LOST_BEDS_REPORT_ERROR',
      },
    ],
    allowedPermissions: ['cas1_reports_view'],
  })

  get(paths.admin.userManagement.index.pattern, userManagementController.index(), {
    auditEvent: 'ADMIN_USER_MANAGEMENT_DASHBOARD',
    allowedPermissions: ['cas1_user_management'],
  })
  get(paths.admin.userManagement.new.pattern, deliusUserController.new(), {
    auditEvent: 'ADMIN_DELIUS_SEARCH_FOR_USER',
    allowedPermissions: ['cas1_user_management'],
  })
  get(paths.admin.userManagement.edit.pattern, userManagementController.edit(), {
    auditEvent: 'ADMIN_USER_PERMISSIONS_PAGE',
    allowedPermissions: ['cas1_user_management'],
  })
  get(paths.admin.userManagement.confirmDelete.pattern, userManagementController.confirmDelete(), {
    auditEvent: 'ADMIN_USER_DELETION_CONFIRMATION_PAGE',
    allowedPermissions: ['cas1_user_management'],
  })
  deleteAction(paths.admin.userManagement.delete.pattern, userManagementController.delete(), {
    auditEvent: 'ADMIN_USER_DELETION',
    allowedPermissions: ['cas1_user_management'],
  })

  post(paths.admin.userManagement.searchDelius.pattern, deliusUserController.search(), {
    auditEvent: 'ADMIN_USER_PERMISSIONS_PAGE',
    allowedPermissions: ['cas1_user_management'],
  })
  put(paths.admin.userManagement.update.pattern, userManagementController.update(), {
    auditEvent: 'ADMIN_UPDATE_USER_PERMISSIONS_SUCCESS',
    allowedPermissions: ['cas1_user_management'],
  })
  post(paths.admin.userManagement.search.pattern, userManagementController.search(), {
    auditEvent: 'ADMIN_SEARCH_USERS',
    allowedPermissions: ['cas1_user_management'],
  })

  return router
}
