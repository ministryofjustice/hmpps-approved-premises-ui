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
    placementAppealController,
    nonArrivalsController,
    departuresController,
    bedsController,
    outOfServiceBedsController,
    updateOutOfServiceBedsController,
    outOfServiceBedCancellationController,
    cancellationsController,
    redirectController,
    keyworkerController,
    apOccupancyViewController,
    changesController,
    transfersController,
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
    allowedPermissions: ['cas1_premises_view'],
  })
  post(paths.premises.index.pattern, premisesController.index(), {
    auditEvent: 'FILTER_PREMISES',
    allowedPermissions: ['cas1_premises_view'],
  })
  get(paths.premises.show.pattern, premisesController.show(), {
    auditEvent: 'SHOW_PREMISES',
    allowedPermissions: ['cas1_premises_view'],
  })

  // Beds
  get(paths.premises.beds.index.pattern, bedsController.index(), {
    auditEvent: 'LIST_BEDS',
    allowedPermissions: ['cas1_premises_view'],
  })
  get(paths.premises.beds.show.pattern, bedsController.show(), {
    auditEvent: 'SHOW_BED',
    allowedPermissions: ['cas1_premises_view'],
  })

  // Placements
  get(paths.premises.placements.showTabApplication.pattern, placementController.show('application'), {
    auditEvent: 'SHOW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_view'],
  })
  get(paths.premises.placements.showTabAssessment.pattern, placementController.show('assessment'), {
    auditEvent: 'SHOW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_view'],
  })
  get(paths.premises.placements.showTabPlacementRequest.pattern, placementController.show('placementRequest'), {
    auditEvent: 'SHOW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_view'],
  })
  get(paths.premises.placements.showTabTimeline.pattern, placementController.show('timeline'), {
    auditEvent: 'SHOW_PLACEMENT',
    allowedPermissions: ['cas1_space_booking_view'],
  })
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
  get(paths.premises.placements.nonArrival.pattern, nonArrivalsController.new(), {
    auditEvent: 'NON_ARRIVAL',
    allowedPermissions: ['cas1_space_booking_record_non_arrival'],
  })
  post(paths.premises.placements.nonArrival.pattern, nonArrivalsController.create(), {
    auditEvent: 'NON_ARRIVAL_SUCCESS',
    allowedPermissions: ['cas1_space_booking_record_non_arrival'],
    redirectAuditEventSpecs: [
      {
        path: paths.premises.placements.nonArrival.pattern,
        auditEvent: 'NON_ARRIVAL_FAILURE',
      },
    ],
  })
  // Placement departures
  get(paths.premises.placements.departure.new.pattern, departuresController.new(), {
    auditEvent: 'NEW_DEPARTURE',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  post(paths.premises.placements.departure.new.pattern, departuresController.saveNew(), {
    auditEvent: 'NEW_DEPARTURE_SAVE',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  get(paths.premises.placements.departure.breachOrRecallReason.pattern, departuresController.breachOrRecallReason(), {
    auditEvent: 'NEW_DEPARTURE_BREACH_OR_RECALL',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  post(
    paths.premises.placements.departure.breachOrRecallReason.pattern,
    departuresController.saveBreachOrRecallReason(),
    {
      auditEvent: 'NEW_DEPARTURE_BREACH_OR_RECALL_SAVE',
      allowedPermissions: ['cas1_space_booking_record_departure'],
    },
  )
  get(paths.premises.placements.departure.moveOnCategory.pattern, departuresController.moveOnCategory(), {
    auditEvent: 'NEW_DEPARTURE_MOVE_ON',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  post(paths.premises.placements.departure.moveOnCategory.pattern, departuresController.saveMoveOnCategory(), {
    auditEvent: 'NEW_DEPARTURE_MOVE_ON_SAVE',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  get(paths.premises.placements.departure.notes.pattern, departuresController.notes(), {
    auditEvent: 'NEW_DEPARTURE_NOTES',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  post(paths.premises.placements.departure.notes.pattern, departuresController.create(), {
    auditEvent: 'NEW_DEPARTURE_CREATE',
    allowedPermissions: ['cas1_space_booking_record_departure'],
  })
  // Placement cancellations
  get(paths.premises.placements.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'NEW_CANCELLATION',
    allowedPermissions: ['cas1_space_booking_withdraw'],
  })
  post(paths.premises.placements.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.premises.placements.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
    allowedPermissions: ['cas1_space_booking_withdraw'],
  })

  // Placement changes
  get(paths.premises.placements.changes.new.pattern, changesController.new(), {
    auditEvent: 'NEW_BOOKING_CHANGE',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.premises.placements.changes.new.pattern, changesController.saveNew(), {
    auditEvent: 'SAVE_NEW_BOOKING_CHANGE',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  get(paths.premises.placements.changes.confirm.pattern, changesController.confirm(), {
    auditEvent: 'CONFIRM_BOOKING_CHANGE',
    allowedPermissions: ['cas1_space_booking_create'],
  })
  post(paths.premises.placements.changes.confirm.pattern, changesController.create(), {
    auditEvent: 'CREATE_BOOKING_CHANGE',
    allowedPermissions: ['cas1_space_booking_create'],
  })

  // Placement transfers
  get(paths.premises.placements.transfers.new.pattern, transfersController.new(), {
    auditEvent: 'TRANSFER_REQUEST_NEW',
    allowedPermissions: ['cas1_transfer_create'],
  })
  post(paths.premises.placements.transfers.new.pattern, transfersController.saveNew(), {
    auditEvent: 'TRANSFER_REQUEST_NEW_SAVE',
    allowedPermissions: ['cas1_transfer_create'],
  })
  get(paths.premises.placements.transfers.emergencyDetails.pattern, transfersController.emergencyDetails(), {
    auditEvent: 'TRANSFER_REQUEST_EMERGENCY_DETAILS',
    allowedPermissions: ['cas1_transfer_create'],
  })
  post(paths.premises.placements.transfers.emergencyDetails.pattern, transfersController.saveEmergencyDetails(), {
    auditEvent: 'TRANSFER_REQUEST_EMERGENCY_DETAILS_SAVE',
    allowedPermissions: ['cas1_transfer_create'],
  })
  get(paths.premises.placements.transfers.confirm.pattern, transfersController.confirm(), {
    auditEvent: 'TRANSFER_REQUEST_CONFIRM',
    allowedPermissions: ['cas1_transfer_create'],
  })
  post(paths.premises.placements.transfers.confirm.pattern, transfersController.create(), {
    auditEvent: 'TRANSFER_REQUEST_CREATE',
    allowedPermissions: ['cas1_transfer_create'],
  })

  // Change requests
  get(paths.premises.placements.appeal.new.pattern, placementAppealController.new(), {
    auditEvent: 'NEW_PLACEMENT_APPEAL',
    allowedPermissions: ['cas1_placement_appeal_create'],
  })

  post(paths.premises.placements.appeal.new.pattern, placementAppealController.newSave(), {
    auditEvent: 'SAVE_PLACEMENT_APPEAL',
    allowedPermissions: ['cas1_placement_appeal_create'],
  })

  get(paths.premises.placements.appeal.confirm.pattern, placementAppealController.confirm(), {
    auditEvent: 'CONFIRM_PLACEMENT_APPEAL',
    allowedPermissions: ['cas1_placement_appeal_create'],
  })

  post(paths.premises.placements.appeal.confirm.pattern, placementAppealController.create(), {
    auditEvent: 'CREATE_PLACEMENT_APPEAL',
    allowedPermissions: ['cas1_placement_appeal_create'],
  })

  // Occupancy
  get(paths.premises.occupancy.view.pattern, apOccupancyViewController.view(), {
    auditEvent: 'VIEW_OCCUPANCY',
    allowedPermissions: ['cas1_premises_view'],
  })

  // Occupancy for day
  get(paths.premises.occupancy.day.pattern, apOccupancyViewController.dayView(), {
    auditEvent: 'VIEW_DAY_SUMMARY',
    allowedPermissions: ['cas1_premises_view'],
  })

  // Bookings
  get(paths.bookings.show.pattern, bookingsController.show(), {
    auditEvent: 'SHOW_BOOKING',
  })

  // Booking date changes
  get(paths.bookings.dateChanges.new.pattern, dateChangesController.new(), {
    auditEvent: 'NEW_DATE_CHANGE',
    allowedPermissions: ['cas1_booking_change_dates'],
  })
  post(paths.bookings.dateChanges.create.pattern, dateChangesController.create(), {
    auditEvent: 'DATE_CHANGE_SUCCESS',
    allowedPermissions: ['cas1_booking_change_dates'],
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.dateChanges.new.pattern,
        auditEvent: 'DATE_CHANGE_FAILURE',
      },
    ],
  })

  // Booking extensions
  get(paths.bookings.extensions.new.pattern, bookingExtensionsController.new(), {
    auditEvent: 'NEW_BOOKING_EXTENSION',
    allowedPermissions: ['cas1_booking_change_dates'],
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
    allowedPermissions: ['cas1_booking_change_dates'],
  })
  get(paths.bookings.extensions.confirm.pattern, bookingExtensionsController.confirm(), {
    allowedPermissions: ['cas1_booking_change_dates'],
  })

  // Booking cancellations
  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'NEW_CANCELLATION',
    allowedPermissions: ['cas1_booking_withdraw'],
  })
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
    allowedPermissions: ['cas1_booking_withdraw'],
  })

  // Out of service beds
  get(paths.outOfServiceBeds.new.pattern, outOfServiceBedsController.new(), {
    auditEvent: 'NEW_OUT_OF_SERVICE_BED',
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
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })
  get(paths.outOfServiceBeds.premisesIndex.pattern, outOfServiceBedsController.premisesIndex(), {
    auditEvent: 'LIST_OUT_OF_SERVICE_BEDS_FOR_A_PREMISES',
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.outOfServiceBeds.update.pattern, updateOutOfServiceBedsController.new(), {
    auditEvent: 'SHOW_UPDATE_OUT_OF_SERVICE_BED',
    allowedPermissions: ['cas1_out_of_service_bed_create'],
  })
  post(paths.outOfServiceBeds.update.pattern, updateOutOfServiceBedsController.create(), {
    auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED',
    allowedPermissions: ['cas1_out_of_service_bed_create'],
    redirectAuditEventSpecs: [
      {
        path: paths.outOfServiceBeds.show.pattern,
        auditEvent: 'CREATE_UPDATE_OUT_OF_SERVICE_BED_FAILURE',
      },
    ],
  })
  get(paths.outOfServiceBeds.cancel.pattern, outOfServiceBedCancellationController.new(), {
    auditEvent: 'SHOW_CANCEL_OUT_OF_SERVICE_BED',
    allowedPermissions: ['cas1_out_of_service_bed_cancel'],
  })
  post(paths.outOfServiceBeds.cancel.pattern, outOfServiceBedCancellationController.cancel(), {
    auditEvent: 'CANCEL_OUT_OF_SERVICE_BED',
    allowedPermissions: ['cas1_out_of_service_bed_cancel'],
  })
  get(paths.outOfServiceBeds.show.pattern, outOfServiceBedsController.show(), {
    auditEvent: 'SHOW_OUT_OF_SERVICE_BED',
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })
  get(paths.outOfServiceBeds.index.pattern, outOfServiceBedsController.index(), {
    auditEvent: 'LIST_ALL_OUT_OF_SERVICE_BEDS',
    allowedPermissions: ['cas1_view_out_of_service_beds'],
  })

  return router
}
