/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'
import paths from '../paths/manage'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const {
    dateChangesController,
    bookingsController,
    bookingExtensionsController,
    v2PremisesController,
    v2BedsController,
    v2OutOfServiceBedsController,
    v2UpdateOutOfServiceBedsController,
  } = controllers

  // Premises
  get(paths.v2Manage.premises.index.pattern, v2PremisesController.index(), {
    auditEvent: 'LIST_PREMISES',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.premises.index.pattern, v2PremisesController.index(), {
    auditEvent: 'FILTER_PREMISES',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.premises.show.pattern, v2PremisesController.show(), {
    auditEvent: 'SHOW_PREMISES',
    allowedRoles: ['future_manager'],
  })

  // Beds
  get(paths.v2Manage.premises.beds.index.pattern, v2BedsController.index(), {
    auditEvent: 'LIST_BEDS',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.premises.beds.show.pattern, v2BedsController.show(), {
    auditEvent: 'SHOW_BED',
    allowedRoles: ['future_manager', 'cru_member'],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })

  // Bookings
  get(paths.v2Manage.bookings.show.pattern, bookingsController.show(), {
    auditEvent: 'SHOW_BOOKING',
    allowedRoles: ['future_manager'],
  })

  // Date changes
  get(paths.v2Manage.bookings.dateChanges.new.pattern, dateChangesController.new(), {
    auditEvent: 'NEW_DATE_CHANGE',
    allowedRoles: ['workflow_manager', 'future_manager'],
  })
  post(paths.v2Manage.bookings.dateChanges.create.pattern, dateChangesController.create(), {
    auditEvent: 'DATE_CHANGE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.bookings.dateChanges.new.pattern,
        auditEvent: 'DATE_CHANGE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'future_manager'],
  })

  // Booking extensions
  get(paths.v2Manage.bookings.extensions.new.pattern, bookingExtensionsController.new(), {
    auditEvent: 'NEW_BOOKING_EXTENSION',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.bookings.extensions.create.pattern, bookingExtensionsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.bookings.extensions.create.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_FAILURE',
      },
      {
        path: paths.v2Manage.bookings.extensions.confirm.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_SUCCESS',
      },
    ],
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  // Out of service beds
  get(paths.v2Manage.outOfServiceBeds.new.pattern, v2OutOfServiceBedsController.new(), {
    auditEvent: 'NEW_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })
  post(paths.v2Manage.outOfServiceBeds.create.pattern, v2OutOfServiceBedsController.create(), {
    auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.outOfServiceBeds.new.pattern,
        auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create', 'cas1_view_out_of_service_beds'],
  })
  get(paths.v2Manage.outOfServiceBeds.premisesIndex.pattern, v2OutOfServiceBedsController.premisesIndex(), {
    auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.v2Manage.outOfServiceBeds.update.pattern, v2UpdateOutOfServiceBedsController.new(), {
    auditEvent: 'SHOW_UPDATE_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  post(paths.v2Manage.outOfServiceBeds.update.pattern, v2UpdateOutOfServiceBedsController.create(), {
    auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.outOfServiceBeds.show.pattern,
        auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
  })
  get(paths.v2Manage.outOfServiceBeds.show.pattern, v2OutOfServiceBedsController.show(), {
    auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.v2Manage.outOfServiceBeds.index.pattern, v2OutOfServiceBedsController.index(), {
    auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })

  return router
}
