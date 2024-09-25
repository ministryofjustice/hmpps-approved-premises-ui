/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../controllers'
import type { Services } from '../services'
import paths from '../paths/manage'

import actions from './utils'

export default function routes(controllers: Controllers, router: Router, services: Partial<Services>): Router {
  const { get, post } = actions(router, services.auditService)

  const {
    bookingsController,
    arrivalsController,
    nonArrivalsController,
    departuresController,
    cancellationsController,
    moveBedsController,
    redirectController,
  } = controllers

  // Deprecated paths, redirect to v2 equivalent
  get(paths.premises.index.pattern, redirectController.redirect(paths.v2Manage.premises.index), {
    auditEvent: 'LIST_PREMISES_REDIRECT',
  })
  get(paths.premises.show.pattern, redirectController.redirect(paths.v2Manage.premises.show), {
    auditEvent: 'SHOW_PREMISES_REDIRECT',
  })

  get(paths.premises.beds.index.pattern, redirectController.redirect(paths.v2Manage.premises.beds.index), {
    auditEvent: 'LIST_BEDS_REDIRECT',
  })
  get(paths.premises.beds.show.pattern, redirectController.redirect(paths.v2Manage.premises.beds.show), {
    auditEvent: 'SHOW_BED_REDIRECT',
  })

  get(
    paths.lostBeds.index.pattern,
    redirectController.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex, { temporality: 'current' }),
    {
      auditEvent: 'LIST_LOST_BEDS_REDIRECT',
    },
  )
  get(paths.lostBeds.new.pattern, redirectController.redirect(paths.v2Manage.outOfServiceBeds.new), {
    auditEvent: 'NEW_LOST_BED_REDIRECT',
  })
  post(paths.lostBeds.create.pattern, redirectController.redirect(paths.v2Manage.outOfServiceBeds.create), {
    auditEvent: 'CREATE_LOST_BED_REDIRECT',
  })
  get(
    paths.lostBeds.show.pattern,
    redirectController.redirect(paths.v2Manage.outOfServiceBeds.show, { tab: 'details' }),
    {
      auditEvent: 'SHOW_LOST_BED_REDIRECT',
    },
  )
  post(paths.lostBeds.update.pattern, redirectController.redirect(paths.v2Manage.outOfServiceBeds.update), {
    auditEvent: 'UPDATE_LOST_BED_REDIRECT',
  })

  get(paths.bookings.show.pattern, redirectController.redirect(paths.v2Manage.bookings.show), {
    auditEvent: 'SHOW_BOOKING_REDIRECT',
  })

  get(paths.bookings.dateChanges.new.pattern, redirectController.redirect(paths.v2Manage.bookings.dateChanges.new), {
    auditEvent: 'NEW_DATE_CHANGE_REDIRECT',
  })
  post(
    paths.bookings.dateChanges.create.pattern,
    redirectController.redirect(paths.v2Manage.bookings.dateChanges.create),
    {
      auditEvent: 'CREATE_DATE_CHANGE_REDIRECT',
    },
  )

  get(paths.bookings.extensions.new.pattern, redirectController.redirect(paths.v2Manage.bookings.extensions.new), {
    auditEvent: 'NEW_BOOKING_EXTENSION_REDIRECT',
  })
  post(
    paths.bookings.extensions.create.pattern,
    redirectController.redirect(paths.v2Manage.bookings.extensions.create),
    {
      auditEvent: 'CREATE_BOOKING_EXTENSION_REDIRECT',
    },
  )
  get(
    paths.bookings.extensions.confirm.pattern,
    redirectController.redirect(paths.v2Manage.bookings.extensions.confirm),
  )

  // End deprecated paths

  get(paths.bookings.new.pattern, bookingsController.new(), {
    auditEvent: 'START_AD_HOC_BOOKING',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  post(paths.bookings.create.pattern, bookingsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.v2Manage.bookings.show.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_FAILURE',
      },
      {
        path: paths.bookings.confirm.pattern,
        auditEvent: 'CREATE_AD_HOC_BOOKING_SUCCESS',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  get(paths.bookings.confirm.pattern, bookingsController.confirm(), {
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new(), {
    auditEvent: 'NEW_ARRIVAL',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  post(paths.bookings.arrivals.create.pattern, arrivalsController.create(), {
    auditEvent: 'CREATE_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.arrivals.new.pattern,
        auditEvent: 'CREATE_ARRIVAL_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })
  get(paths.bookings.nonArrivals.new.pattern, nonArrivalsController.new(), {
    auditEvent: 'NEW_NON_ARRIVAL',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  post(paths.bookings.nonArrivals.create.pattern, nonArrivalsController.create(), {
    auditEvent: 'CREATE_NON_ARRIVAL_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.nonArrivals.new.pattern,
        auditEvent: 'CREATE_NON_ARRIVAL_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })
  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'NEW_CANCELLATION',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    auditEvent: 'CREATE_CANCELLATION_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_CANCELLATION_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })
  get(paths.bookings.departures.new.pattern, departuresController.new(), {
    auditEvent: 'NEW_DEPARTURE',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  post(paths.bookings.departures.create.pattern, departuresController.create(), {
    auditEvent: 'CREATE_DEPARTURE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.departures.new.pattern,
        auditEvent: 'CREATE_DEPARTURE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  get(paths.bookings.moves.new.pattern, moveBedsController.new(), {
    auditEvent: 'NEW_BED_MOVE',
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })
  post(paths.bookings.moves.create.pattern, moveBedsController.create(), {
    auditEvent: 'BED_MOVE_SUCCESS',
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.moves.new.pattern,
        auditEvent: 'BED_MOVE_FAILURE',
      },
    ],
    allowedRoles: ['workflow_manager', 'manager', 'legacy_manager', 'future_manager'],
  })

  return router
}
