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
  get(paths.v2Manage.premises.index.pattern, premisesController.index(), { auditEvent: 'LIST_PREMISES' })
  post(paths.v2Manage.premises.index.pattern, premisesController.index(), { auditEvent: 'FILTER_PREMISES' })
  get(paths.v2Manage.premises.show.pattern, premisesController.show(), { auditEvent: 'SHOW_PREMISES' })

  // Beds
  get(paths.v2Manage.premises.beds.index.pattern, bedsController.index(), { auditEvent: 'LIST_BEDS' })
  get(paths.v2Manage.premises.beds.show.pattern, bedsController.show(), { auditEvent: 'SHOW_BED' })
  get(paths.v2Manage.premises.beds.overbookings.show.pattern, bedsController.overbookings(), {
    auditEvent: 'SHOW_OVERBOOKINGS',
  })

  // Bookings
  get(paths.v2Manage.bookings.show.pattern, bookingsController.show(), { auditEvent: 'SHOW_BOOKING' })

  // Date changes
  get(paths.v2Manage.bookings.dateChanges.new.pattern, dateChangesController.new(), {
    auditEvent: 'NEW_DATE_CHANGE',
  })
  post(paths.bookings.dateChanges.create.pattern, dateChangesController.create(), {
    auditEvent: 'DATE_CHANGE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.dateChanges.new.pattern,
        auditEvent: 'DATE_CHANGE_FAILURE',
      },
    ],
  })

  // Booking extensions
  get(paths.v2Manage.bookings.extensions.new.pattern, bookingExtensionsController.new(), {
    auditEvent: 'NEW_BOOKING_EXTENSION',
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
  })
  get(paths.v2Manage.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  // Out of service beds
  get(paths.v2Manage.outOfServiceBeds.new.pattern, outOfServiceBedsController.new(), {
    auditEvent: 'NEW_OUT_OF_SERVICE_BED',
  })
  post(paths.v2Manage.outOfServiceBeds.create.pattern, outOfServiceBedsController.create(), {
    auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.outOfServiceBeds.new.pattern,
        auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
  })
  get(paths.v2Manage.outOfServiceBeds.index.pattern, outOfServiceBedsController.index(), {
    auditEvent: 'LIST_OUT_OF_SERVICE_BEDS',
  })
  get(paths.v2Manage.outOfServiceBeds.show.pattern, outOfServiceBedsController.show(), {
    auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
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
  })

  return router
}
