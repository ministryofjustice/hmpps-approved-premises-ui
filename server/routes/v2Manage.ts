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
    premisesController,
    bookingsController,
    bookingExtensionsController,
    outOfServiceBedsController,
    bedsController,
  } = controllers

  // Premises
  get(paths.v2Manage.premises.index.pattern, premisesController.index(), {
    auditEvent: 'LIST_PREMISES',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.premises.index.pattern, premisesController.index(), {
    auditEvent: 'FILTER_PREMISES',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.premises.show.pattern, premisesController.show(), {
    auditEvent: 'SHOW_PREMISES',
    allowedRoles: ['future_manager'],
  })

  // Beds
  get(paths.v2Manage.premises.beds.index.pattern, bedsController.index(), {
    auditEvent: 'LIST_BEDS',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.premises.beds.show.pattern, bedsController.show(), {
    auditEvent: 'SHOW_BED',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.premises.beds.overbookings.show.pattern, bedsController.overbookings(), {
    auditEvent: 'SHOW_OVERBOOKINGS',
    allowedRoles: ['future_manager'],
  })

  // Bookings
  get(paths.v2Manage.bookings.show.pattern, bookingsController.show(), {
    auditEvent: 'SHOW_BOOKING',
    allowedRoles: ['future_manager'],
  })

  // Date changes
  get(paths.v2Manage.bookings.dateChanges.new.pattern, dateChangesController.new(), {
    auditEvent: 'NEW_DATE_CHANGE',
    allowedRoles: ['future_manager'],
  })
  post(paths.bookings.dateChanges.create.pattern, dateChangesController.create(), {
    auditEvent: 'DATE_CHANGE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.dateChanges.new.pattern,
        auditEvent: 'DATE_CHANGE_FAILURE',
      },
    ],
    allowedRoles: ['future_manager'],
  })

  // Booking extensions
  get(paths.v2Manage.bookings.extensions.new.pattern, bookingExtensionsController.new(), {
    auditEvent: 'NEW_BOOKING_EXTENSION',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.bookings.extensions.create.pattern, bookingExtensionsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.extensions.create.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_FAILURE',
      },
      {
        path: paths.bookings.extensions.confirm.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_SUCCESS',
      },
    ],
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  // Out of service beds
  get(paths.v2Manage.outOfServiceBeds.new.pattern, outOfServiceBedsController.new(), {
    auditEvent: 'NEW_OUT_OF_SERVICE_BED',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.outOfServiceBeds.create.pattern, outOfServiceBedsController.create(), {
    auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.outOfServiceBeds.new.pattern,
        auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.outOfServiceBeds.premisesIndex.pattern, outOfServiceBedsController.premisesIndex(), {
    auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.outOfServiceBeds.show.pattern, outOfServiceBedsController.show(), {
    auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
    allowedRoles: ['future_manager'],
  })
  post(paths.v2Manage.outOfServiceBeds.update.pattern, outOfServiceBedsController.update(), {
    auditEvent: 'UPDATE_OUT_OF_SERVICE_BED_SUCCESS',
    auditBodyParams: ['cancel'],
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.outOfServiceBeds.show.pattern,
        auditEvent: 'UPDATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
    allowedRoles: ['future_manager'],
  })
  get(paths.v2Manage.outOfServiceBeds.index.pattern, outOfServiceBedsController.index(), {
    auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
    allowedRoles: ['cru_member'],
  })

  return router
}
