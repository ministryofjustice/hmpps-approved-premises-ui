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
    placementController,
    arrivalsController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    cancellationsController,
    redirectController,
    keyworkerController,
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

  // Placements
  get(paths.premises.placements.show.pattern, placementController.show(), {
    auditEvent: 'SHOW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_view'],
  })
  get(paths.premises.placements.arrival.pattern, arrivalsController.new(), {
    auditEvent: 'NEW_ARRIVAL',
    allowedPermissions: ['cas1_space_booking_record_arrival'],
  })
  post(paths.premises.placements.arrival.pattern, arrivalsController.create(), {
    auditEvent: 'CREATE_ARRIVAL_SUCCESS',
    allowedPermissions: ['cas1_space_booking_record_arrival'],
    redirectAuditEventSpecs: [
      {
        path: paths.premises.placements.arrival.pattern,
        auditEvent: 'CREATE_ARRIVAL_FAILURE',
      },
    ],
  })
  get(paths.premises.placements.keyworker.pattern, keyworkerController.new(), {
    auditEvent: 'ASSIGN_KEYWORKER',
    allowedPermissions: ['cas1_space_booking_record_keyworker'],
  })
  post(paths.premises.placements.keyworker.pattern, keyworkerController.assign(), {
    auditEvent: 'ASSIGN_KEYWORKER_SUCCESS',
    allowedPermissions: ['cas1_space_booking_record_keyworker'],
    redirectAuditEventSpecs: [
      {
        path: paths.premises.placements.keyworker.pattern,
        auditEvent: 'ASSIGN_KEYWORKER_FAILURE',
      },
    ],
  })

  // Bookings
  get(paths.bookings.show.pattern, bookingsController.show(), {
    auditEvent: 'SHOW_BOOKING',
    allowedRoles: ['workflow_manager', 'future_manager'],
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

  // Booking cancellations
  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'NEW_CANCELLATION',
    allowedRoles: ['workflow_manager', 'future_manager'],
  })
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'future_manager'],
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
