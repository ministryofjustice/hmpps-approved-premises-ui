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
    premisesController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    moveBedsController,
    redirectController,
  } = controllers

  // Deprecated paths, redirect to v2 equivalent
  get(paths.deprecated.premises.index.pattern, redirectController.redirect(paths.premises.index), {
    auditEvent: 'LIST_PREMISES_REDIRECT',
  })
  get(paths.deprecated.premises.show.pattern, redirectController.redirect(paths.premises.show), {
    auditEvent: 'SHOW_PREMISES_REDIRECT',
  })

  get(paths.deprecated.premises.beds.index.pattern, redirectController.redirect(paths.premises.beds.index), {
    auditEvent: 'LIST_BEDS_REDIRECT',
  })
  get(paths.deprecated.premises.beds.show.pattern, redirectController.redirect(paths.premises.beds.show), {
    auditEvent: 'SHOW_BED_REDIRECT',
  })

  get(
    paths.deprecated.lostBeds.index.pattern,
    redirectController.redirect(paths.outOfServiceBeds.premisesIndex, { temporality: 'current' }),
    {
      auditEvent: 'LIST_LOST_BEDS_REDIRECT',
    },
  )
  get(paths.deprecated.lostBeds.new.pattern, redirectController.redirect(paths.outOfServiceBeds.new), {
    auditEvent: 'NEW_LOST_BED_REDIRECT',
  })
  post(paths.deprecated.lostBeds.create.pattern, redirectController.redirect(paths.outOfServiceBeds.create), {
    auditEvent: 'CREATE_LOST_BED_REDIRECT',
  })
  get(
    paths.deprecated.lostBeds.show.pattern,
    redirectController.redirect(paths.outOfServiceBeds.show, { tab: 'details' }),
    {
      auditEvent: 'SHOW_LOST_BED_REDIRECT',
    },
  )
  post(paths.deprecated.lostBeds.update.pattern, redirectController.redirect(paths.outOfServiceBeds.update), {
    auditEvent: 'UPDATE_LOST_BED_REDIRECT',
  })

  get(paths.deprecated.bookings.show.pattern, redirectController.redirect(paths.bookings.show), {
    auditEvent: 'SHOW_BOOKING_REDIRECT',
  })

  get(paths.deprecated.bookings.dateChanges.new.pattern, redirectController.redirect(paths.bookings.dateChanges.new), {
    auditEvent: 'NEW_DATE_CHANGE_REDIRECT',
  })
  post(
    paths.deprecated.bookings.dateChanges.create.pattern,
    redirectController.redirect(paths.bookings.dateChanges.create),
    {
      auditEvent: 'CREATE_DATE_CHANGE_REDIRECT',
    },
  )

  get(paths.deprecated.bookings.extensions.new.pattern, redirectController.redirect(paths.bookings.extensions.new), {
    auditEvent: 'NEW_BOOKING_EXTENSION_REDIRECT',
  })
  post(
    paths.deprecated.bookings.extensions.create.pattern,
    redirectController.redirect(paths.bookings.extensions.create),
    {
      auditEvent: 'CREATE_BOOKING_EXTENSION_REDIRECT',
    },
  )
  get(
    paths.deprecated.bookings.extensions.confirm.pattern,
    redirectController.redirect(paths.bookings.extensions.confirm),
  )
  // End deprecated paths

  // Premises
  get(paths.premises.index.pattern, premisesController.index(), {
    auditEvent: 'LIST_PREMISES',
    allowedRoles: ['future_manager'],
  })
  post(paths.premises.index.pattern, premisesController.index(), {
    auditEvent: 'FILTER_PREMISES',
    allowedRoles: ['future_manager'],
  })
  get(paths.premises.show.pattern, premisesController.show(), {
    auditEvent: 'SHOW_PREMISES',
    allowedRoles: ['future_manager'],
  })

  // Beds
  get(paths.premises.beds.index.pattern, bedsController.index(), {
    auditEvent: 'LIST_BEDS',
    allowedRoles: ['future_manager'],
  })
  get(paths.premises.beds.show.pattern, bedsController.show(), {
    auditEvent: 'SHOW_BED',
    allowedRoles: ['future_manager', 'cru_member'],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })

  // Bookings
  get(paths.bookings.new.pattern, bookingsController.new(), {
    auditEvent: 'START_AD_HOC_BOOKING',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  get(paths.bookings.show.pattern, bookingsController.show(), {
    auditEvent: 'SHOW_BOOKING',
    allowedRoles: ['workflow_manager', 'future_manager'],
  })
  post(paths.bookings.create.pattern, bookingsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_FAILURE',
      },
      {
        path: paths.bookings.confirm.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_SUCCESS',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  get(paths.bookings.confirm.pattern, bookingsController.confirm(), {
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Booking date changes
  get(paths.bookings.dateChanges.new.pattern, dateChangesController.new(), {
    auditEvent: 'NEW_DATE_CHANGE',
    allowedRoles: ['workflow_manager', 'future_manager'],
  })
  post(paths.bookings.dateChanges.create.pattern, dateChangesController.create(), {
    auditEvent: 'DATE_CHANGE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.dateChanges.new.pattern,
        auditEvent: 'DATE_CHANGE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'future_manager'],
  })

  // Booking extensions
  get(paths.bookings.extensions.new.pattern, bookingExtensionsController.new(), {
    auditEvent: 'NEW_BOOKING_EXTENSION',
    allowedRoles: ['future_manager'],
  })
  post(paths.bookings.extensions.create.pattern, bookingExtensionsController.create(), {
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
  get(paths.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm())

  // Booking arrivals
  get(paths.bookings.arrivals.new.pattern, arrivalsController.new(), {
    auditEvent: 'NEW_ARRIVAL',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create(), {
    auditEvent: 'CREATE_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.arrivals.new.pattern,
        auditEvent: 'CREATE_ARRIVAL_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Booking non-arrivals
  get(paths.bookings.nonArrivals.new.pattern, nonArrivalsController.new(), {
    auditEvent: 'NEW_NON_ARRIVAL',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.nonArrivals.create.pattern, nonArrivalsController.create(), {
    auditEvent: 'CREATE_NON_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.nonArrivals.new.pattern,
        auditEvent: 'CREATE_NON_ARRIVAL_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Booking cancellations
  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'NEW_CANCELLATION',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Booking departures
  get(paths.bookings.departures.new.pattern, departuresController.new(), {
    auditEvent: 'NEW_DEPARTURE',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.departures.create.pattern, departuresController.create(), {
    auditEvent: 'CREATE_DEPARTURE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.departures.new.pattern,
        auditEvent: 'CREATE_DEPARTURE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Booking moves
  get(paths.bookings.moves.new.pattern, moveBedsController.new(), {
    auditEvent: 'NEW_BED_MOVE',
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.moves.create.pattern, moveBedsController.create(), {
    auditEvent: 'BED_MOVE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.moves.new.pattern,
        auditEvent: 'BED_MOVE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'legacy_manager', 'future_manager'],
  })

  // Out of service beds
  get(paths.outOfServiceBeds.new.pattern, outOfServiceBedsController.new(), {
    auditEvent: 'NEW_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })
  post(paths.outOfServiceBeds.create.pattern, outOfServiceBedsController.create(), {
    auditEvent: 'CREATE_OUT_OF_SERVICE_BED_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.outOfServiceBeds.new.pattern,
        auditEvent: 'CREATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create', 'cas1_view_out_of_service_beds'],
  })
  get(paths.outOfServiceBeds.premisesIndex.pattern, outOfServiceBedsController.premisesIndex(), {
    auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.outOfServiceBeds.update.pattern, updateOutOfServiceBedsController.new(), {
    auditEvent: 'SHOW_UPDATE_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  post(paths.outOfServiceBeds.update.pattern, updateOutOfServiceBedsController.create(), {
    auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_out_of_service_bed_create'],
    redirectAuditEventSpecs: [
      {
        path: paths.outOfServiceBeds.show.pattern,
        auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
  })
  get(paths.outOfServiceBeds.show.pattern, outOfServiceBedsController.show(), {
    auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.outOfServiceBeds.index.pattern, outOfServiceBedsController.index(), {
    auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
    allowedRoles: [],
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })

  return router
}
